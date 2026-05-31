import pool from "../../DB/db"

const createIssueInToDB = async (payload: any) => {

    const { title, description, type, user } = payload

    const reporter_id = user.id

    const result = await pool.query(
        `
        INSERT INTO issues
        (title, description, type, status, reporter_id)
        VALUES ($1, $2, $3, 'open', $4)
        RETURNING *
        `,
        [title, description, type, reporter_id]
    )

    return result.rows[0]
}

const getAllIssuesFromDB = async (query: any) => {

    let { sort = "newest", type, status } = query

    let conditions: string[] = []
    let values: any[] = []

    // FILTER: type
    if (type) {
        values.push(type)
        conditions.push(`type = $${values.length}`)
    }

    // FILTER: status
    if (status) {
        values.push(status)
        conditions.push(`status = $${values.length}`)
    }

    let whereClause = ""
    if (conditions.length > 0) {
        whereClause = "WHERE " + conditions.join(" AND ")
    }

    // SORT
    let orderBy = "ORDER BY created_at DESC"

    if (sort === "oldest") {
        orderBy = "ORDER BY created_at ASC"
    }

    // 1️⃣ Get issues
    const issuesResult = await pool.query(
        `
        SELECT * FROM issues
        ${whereClause}
        ${orderBy}
        `,
        values
    )

    const issues = issuesResult.rows

    // 2️⃣ Get all reporter ids
    const reporterIds = [...new Set(issues.map(i => i.reporter_id))]

    let usersMap: any = {}

    if (reporterIds.length > 0) {
        const usersResult = await pool.query(
            `
            SELECT id, name, role
            FROM users
            WHERE id = ANY($1)
            `,
            [reporterIds]
        )

        usersResult.rows.forEach(user => {
            usersMap[user.id] = user
        })
    }

    // 3️⃣ attach reporter data
    const finalData = issues.map(issue => {
        return {
            ...issue,
            reporter: usersMap[issue.reporter_id] || null
        }
    })

    return finalData
}

const getSingleIssueFromDB = async (id: string) => {

    // 1️⃣ get issue
    const issueResult = await pool.query(
        `
        SELECT * FROM issues
        WHERE id = $1
        `,
        [id]
    )

    if (issueResult.rows.length === 0) {
        throw new Error("Issue not found")
    }

    const issue = issueResult.rows[0]

    // 2️⃣ get reporter
    const userResult = await pool.query(
        `
        SELECT id, name, role
        FROM users
        WHERE id = $1
        `,
        [issue.reporter_id]
    )

    const reporter = userResult.rows[0] || null

    // 3️⃣ merge data
    return {
        ...issue,
        reporter
    }
}

const updateIssueIntoDB = async (id: string,payload: any,user: any) => {

    // 1️⃣ find issue
    const issueResult = await pool.query(
        `SELECT * FROM issues WHERE id = $1`,
        [id]
    )

    if (issueResult.rows.length === 0) {
        throw new Error("Issue not found")
    }

    const issue = issueResult.rows[0]

    // 2️⃣ role check
    const isMaintainer = user.role === "maintainer"
    const isOwner = issue.reporter_id === user.id

    if (!isMaintainer) {

        // contributor rule
        if (!isOwner) {
            throw new Error("Not allowed to update this issue")
        }

        if (issue.status !== "open") {
            throw new Error("You can only update open issues")
        }
    }

    // 3️⃣ update fields
    const { title, description, type } = payload

    const result = await pool.query(
        `
        UPDATE issues
        SET
            title = COALESCE($1, title),
            description = COALESCE($2, description),
            type = COALESCE($3, type),
            status = CASE 
                        WHEN $4 = true THEN 'in_progress'
                        ELSE status
                     END,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $5
        RETURNING *
        `,
        [
            title || null,
            description || null,
            type || null,
            isMaintainer,
            id
        ]
    )

    return result.rows[0]
}

const deleteIssueFromDB = async (id: string) => {

    // check issue exists
    const issueResult = await pool.query(
        `
        SELECT * FROM issues
        WHERE id = $1
        `,
        [id]
    )

    if (issueResult.rows.length === 0) {
        throw new Error("Issue not found")
    }

    // delete issue
    await pool.query(
        `
        DELETE FROM issues
        WHERE id = $1
        `,
        [id]
    )

    return
}

export const issueService = {
    createIssueInToDB,
    getAllIssuesFromDB,
    getSingleIssueFromDB,
    updateIssueIntoDB,
    deleteIssueFromDB
}