const pool = require("./db");

const addStudent = async (req, res) => {
  try {
    const { name, email, age } = req.body;
    if (!name || !email)
      return res.status(400).json({ error: "name and email are required" });

    const result = await pool.query(
      `INSERT INTO students (name, email, age) VALUES ($1, $2, $3) RETURNING *`,
      [name, email, age]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "Email already exists" });
    }
    res.status(500).json({ error: err.message });
  }
};

const getStudentList = async (req, res) => {
  try {
    let { page, limit } = req.query;
    page = Math.max(parseInt(page) || 1, 1);
    limit = Math.max(parseInt(limit) || 10, 1);
    const offset = (page - 1) * limit;

    const totalResult = await pool.query("SELECT COUNT(*) FROM students");
    const total = parseInt(totalResult.rows[0].count, 10);

    const result = await pool.query(
      `SELECT * FROM students ORDER BY id ASC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    res.json({
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      students: result.rows,
    });
  } catch (error) {
    res.status(500).json({ error: err.message });
  }
};

const getStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const s = await pool.query("SELECT * FROM students WHERE id = $1", [id]);
    if (s.rows.length === 0)
      return res.status(404).json({ error: "Student not found" });

    const marks = await pool.query(
      "SELECT id, subject, marks FROM marks WHERE student_id = $1 ORDER BY id",
      [id]
    );

    res.json({ ...s.rows[0], marks: marks.rows });
  } catch (error) {
    res.status(500).json({ error: err.message });
  }
};

const putStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, age } = req.body;
    const existing = await pool.query("SELECT * FROM students WHERE id = $1", [
      id,
    ]);
    if (existing.rows.length === 0)
      return res.status(404).json({ error: "Student not found" });

    const current = existing.rows[0];
    const newName = name ?? current.name;
    const newEmail = email ?? current.email;
    const newAge = age ?? current.age;

    const updated = await pool.query(
      `UPDATE students SET name=$1, email=$2, age=$3 WHERE id=$4 RETURNING *`,
      [newName, newEmail, newAge, id]
    );

    res.json(updated.rows[0]);
  } catch (error) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "Email already exists" });
    }
    res.status(500).json({ error: err.message });
  }
};

const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM students WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Student not found" });
    res.json({ message: "Deleted", student: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  addStudent,
  getStudent,
  getStudentList,
  putStudent,
  deleteStudent,
};
