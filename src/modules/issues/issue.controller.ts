import type { Request, Response } from "express";
import { createIssue, deleteIssue, getAllIssues, getSingleIssue, updateIssue } from "./issue.service";

export const create = async (
  req: Request,
  res: Response
) => {
  try {
    const reporterId = req.user?.id;

    if (!reporterId) {
      throw new Error("Reporter id is required");
    }

    const issue = await createIssue(req.body, Number(reporterId));
    res.status(201).json({
      success: true,
      message: "Issue created successfully",
      data: issue,
    });
  }
  catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getIssues = async (
  req: Request,
  res: Response
) => {
  try {
    const { sort, type, status } =
      req.query;

    const issues = await getAllIssues(
      sort as string,
      type as string,
      status as string
    );

    res.status(200).json({
      success: true,
      data: issues,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// get single issue
export const getIssue = async (
  req: Request,
  res: Response
) => {

  try {

    const issue =
      await getSingleIssue(
        Number(req.params.id)
      );

    res.status(200).json({
      success: true,
      data: issue,
    });

  } catch (error: any) {

    res.status(404).json({
      success: false,
      message: error.message,
    });

  }
};


// update issue
export const update = async (
  req: Request,
  res: Response
) => {

  try {

    const updatedIssue =
      await updateIssue(
        // console.log(req.params.id),
        Number(req.params.id),
        // console.log(req.body),
        req.body,
        // console.log(req.user),
        req.user
      );

    res.status(200).json({
      success: true,
      message:
        "Issue updated successfully",
      data: updatedIssue,
    });

  } catch (error: any) {

    res.status(400).json({
      success: false,
      message: error.message,
    });

  }
};


// delete issue
export const remove = async (
  req: Request,
  res: Response
) => {

  try {

    await deleteIssue(
      Number(req.params.id),
      req.user
    );

    res.status(200).json({
      success: true,
      message:
        "Issue deleted successfully",
    });

  } catch (error: any) {

    res.status(400).json({
      success: false,
      message: error.message,
    });

  }
};
