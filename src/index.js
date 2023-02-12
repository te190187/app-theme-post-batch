//@ts-check
require("dotenv").config();

const mysql = require("mysql2/promise");
const aggregats = require("./aggregates");

async function main() {
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    throw new Error("DATABASE_URL must be set");
  }

  let connection;
  try {
    connection = await mysql.createConnection(DATABASE_URL);

    await aggregats.updateRecommendedTheme(connection);
    await aggregats.updateManyLikesTheme(connection);
    await aggregats.updateManyDevelopersTheme(connection);
    await aggregats.updateManyCommentsTheme(connection);
    await aggregats.updateThemeOwnerRanking(connection);
    await aggregats.updateThemeDeveloperRanking(connection);
  } catch (e) {
    await connection?.rollback();
    throw e;
  } finally {
    connection?.end();
  }
}

main()
  .then(() => console.log("集計処理実行完了"))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
