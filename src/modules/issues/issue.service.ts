import { pool } from "../../db";


// create issue
export const createIssue = async (
  payload: any,
  reporterId: number
) => {
  const { title, description, type } =
    payload;

  const result = await pool.query(
    `
    INSERT INTO issues(title,description,type,reporter_id)
    VALUES($1,$2,$3,$4)
    RETURNING *
  `,
    [title, description, type, reporterId]
  );

  return result.rows[0];
};

// get all user issues

export const getAllIssues = async (
  sort = "newest",
  type?: string,
  status?: string
) => {
  let query = `SELECT * FROM issues`;
  let conditions = [];
  let values = [];

  if (type) {
    conditions.push(`type = $${values.length + 1}`);
    values.push(type);
  }

  if (status) {
    conditions.push(
      `status = $${values.length + 1}`
    );
    values.push(status);
  }

  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(" AND ")}`;
  }

  query += ` ORDER BY created_at ${
    sort === "oldest" ? "ASC" : "DESC"
  }`;

  const issues = await pool.query(query, values);

  return issues.rows;
};

// get single issue
export const getSingleIssue = async (
  issueId: number
) => {

  // issue find
  const issueResult = await pool.query(
    `SELECT * FROM issues WHERE id = $1`,
    [issueId]
  );

  const issue = issueResult.rows[0];

  if (!issue) {
    throw new Error("Issue not found");
  }

  // reporter find
  const reporterResult = await pool.query(
    `
    SELECT id,name,role
    FROM users
    WHERE id = $1
  `,
    [issue.reporter_id]
  );

  const reporter =
    reporterResult.rows[0];

  return {
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter,
    created_at: issue.created_at,
    updated_at: issue.updated_at,
  };
};


// update issue
export const updateIssue = async (
  issueId: number,
  payload: any,
  user: any
) => {

  const issueResult = await pool.query(
    `SELECT * FROM issues WHERE id = $1`,
    [issueId]
  );

  const issue = issueResult.rows[0];

  if (!issue) {
    throw new Error("Issue not found");
  }

  // maintainer can update all
  if (user.role === "maintainer") {

    const updatedIssue =
      await pool.query(
        `
      UPDATE issues
      SET
      title = $1,
      description = $2,
      type = $3,
      updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *
    `,
        [
          payload.title,
          payload.description,
          payload.type,
          issueId,
        ]
      );

    return updatedIssue.rows[0];
  }

  // contributor rules
  if (user.role === "contributor") {

    // own issue only
    if (issue.reporter_id !== user.id) {
      throw new Error(
        "You can update only your own issue"
      );
    }

    // only open issue
    if (issue.status !== "open") {
      throw new Error(
        "Only open issue can be updated"
      );
    }

    const updatedIssue =
      await pool.query(
        `
      UPDATE issues
      SET
      title = $1,
      description = $2,
      type = $3,
      updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *
    `,
        [
          payload.title,
          payload.description,
          payload.type,
          issueId,
        ]
      );

    return updatedIssue.rows[0];
  }

  throw new Error("Unauthorized");
};


// delete issue
export const deleteIssue = async (
  issueId: number,
  user: any
) => {

  // maintainer only
  if (user.role !== "maintainer") {
    throw new Error(
      "Only maintainer can delete issue"
    );
  }

  const issueResult = await pool.query(
    `SELECT * FROM issues WHERE id = $1`,
    [issueId]
  );

  const issue = issueResult.rows[0];

  if (!issue) {
    throw new Error("Issue not found");
  }

  await pool.query(
    `DELETE FROM issues WHERE id = $1`,
    [issueId]
  );

  return true;
};