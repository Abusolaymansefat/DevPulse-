import app from "./app";
import config from "./config";

const main = async () => {
      // console.log(config.database_url)
      app.listen(config.port, () => {
            console.log(`Server is running on port ${config.port}`)
      })
}

main();