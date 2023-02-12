//@ts-check

/**@typedef {import("mysql2/promise").Connection} Connection  */

// おすすめのお題を更新する
// 現段階では、おすすめのお題は1ヶ月の間に良いねが多かったお題
/** @param conn {Connection} */
async function updateRecommendedTheme(conn) {
  await conn.beginTransaction();

  await conn.query("DELETE FROM RecommendedTheme;");

  const [result] = await conn.query(`
    SELECT
      AppTheme.id as themeId
      , COUNT(AppThemeLike.id) as likes
      , MIN(AppTheme.createdAt) as firstPostDatetime
    FROM
      AppThemeLike
      LEFT JOIN AppTheme
        ON (AppThemeLike.appThemeId = AppTheme.id)
    WHERE
      AppTheme.createdAt > (NOW() - INTERVAL 1 MONTH)
    GROUP BY
      AppTheme.id
    ORDER By
      likes DESC
      , firstPostDatetime ASC
    LIMIT
      10
  `);

  // @ts-ignore
  for (const row of result) {
    await conn.query("INSERT INTO RecommendedTheme (themeId) VALUES (?)", [
      row.themeId,
    ]);
  }

  await conn.commit();
}

// いいねが多かったお題を更新する
/** @param conn {Connection} */
async function updateManyLikesTheme(conn) {
  await conn.beginTransaction();

  // とりあえず今は以前のデータを全部消す・・・
  await conn.query("DELETE FROM ManyLikesTheme;");

  const [result] = await conn.query(`
    SELECT
      AppTheme.id as themeId
      , COUNT(AppThemeLike.id) as likes
    FROM 
      AppTheme
      LEFT JOIN
        AppThemeLike ON (AppTheme.id = AppThemeLike.appThemeId)
    GROUP BY
      AppTheme.id
  `);

  // @ts-ignore
  for (const row of result) {
    await conn.query(
      "INSERT INTO ManyLikesTheme (themeId, likes) VALUES (?, ?)",
      [row.themeId, row.likes]
    );
  }

  await conn.commit();
}

// 開発者が多かったお題を更新する
/** @param conn {Connection} */
async function updateManyDevelopersTheme(conn) {
  await conn.beginTransaction();

  // とりあえず今は以前のデータを全部消す・・・
  await conn.query("DELETE FROM ManyDevelopersTheme;");

  const [result] = await conn.query(`
    SELECT
      AppTheme.id as themeId
      , COUNT(AppThemeDeveloper.id) as developers
    FROM 
      AppTheme
      LEFT JOIN
        AppThemeDeveloper ON (AppTheme.id = AppThemeDeveloper.appThemeId)
    GROUP BY
      AppTheme.id
  `);

  // @ts-ignore
  for (const row of result) {
    await conn.query(
      "INSERT INTO ManyDevelopersTheme (themeId, developers) VALUES (?, ?)",
      [row.themeId, row.developers]
    );
  }

  await conn.commit();
}

// コメントが多かったお題を更新する
/** @param conn {Connection} */
async function updateManyCommentsTheme(conn) {
  await conn.beginTransaction();

  // とりあえず今は以前のデータを全部消す・・・
  await conn.query("DELETE FROM ManyCommentsTheme;");

  const [result] = await conn.query(`
    SELECT
      AppTheme.id as themeId
      , COUNT(AppThemeComment.id) as comments
    FROM 
      AppTheme
      LEFT JOIN
        AppThemeComment ON (AppTheme.id = AppThemeComment.themeId)
    GROUP BY
      AppTheme.id
  `);

  // @ts-ignore
  for (const row of result) {
    await conn.query(
      "INSERT INTO ManyCommentsTheme (themeId, comments) VALUES (?, ?)",
      [row.themeId, row.comments]
    );
  }

  await conn.commit();
}

// 1ヶ月の間にいいねが多かった投稿者を更新する
/** @param conn {Connection} */
async function updateThemeOwnerRanking(conn) {
  await conn.beginTransaction();

  await conn.query("DELETE FROM ThemeOwnerRanking;");

  const [result] = await conn.query(`
    SELECT
      User.id as userId
      , Count(AppThemeLike.id) as likes
    FROM
      AppThemeLike
      LEFT JOIN AppTheme
        ON (AppThemeLike.appThemeId = AppTheme.id)
      LEFT JOIN User
        ON (AppTheme.userId = User.id)
    WHERE
      AppThemeLike.createdAt > (NOW() - INTERVAL 1 MONTH)
    GROUP BY
      User.id
  `);

  // @ts-ignore
  for (const row of result) {
    await conn.query(
      "INSERT INTO ThemeOwnerRanking (userId, likes) VALUES (?, ?)",
      [row.userId, row.likes]
    );
  }

  await conn.commit();
}

// １ヶ月の間にいいねが多かった開発者を更新する
/** @param conn {Connection} */
async function updateThemeDeveloperRanking(conn) {
  await conn.beginTransaction();

  await conn.query("DELETE FROM ThemeDeveloperRanking;");

  const [result] = await conn.query(`
    SELECT
      User.id as userId
      , Count(AppThemeDeveloperLike.id) as likes
    FROM
      AppThemeDeveloperLike
      LEFT JOIN AppThemeDeveloper
        ON (AppThemeDeveloperLike.developerId = AppThemeDeveloper.id)
      LEFT JOIN User
        ON (AppThemeDeveloper.userId = User.id)
    WHERE
      AppThemeDeveloperLike.createdAt > (NOW() - INTERVAL 1 MONTH)
    GROUP BY
      User.id
  `);

  // @ts-ignore
  for (const row of result) {
    await conn.query(
      "INSERT INTO ThemeDeveloperRanking (userId, likes) VALUES (?, ?)",
      [row.userId, row.likes]
    );
  }

  await conn.commit();
}

exports.updateRecommendedTheme = updateRecommendedTheme;
exports.updateManyLikesTheme = updateManyLikesTheme;
exports.updateManyDevelopersTheme = updateManyDevelopersTheme;
exports.updateManyCommentsTheme = updateManyCommentsTheme;
exports.updateThemeOwnerRanking = updateThemeOwnerRanking;
exports.updateThemeDeveloperRanking = updateThemeDeveloperRanking;
