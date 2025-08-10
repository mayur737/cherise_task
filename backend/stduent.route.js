const express = require("express");
const {
  addStudent,
  getStudentList,
  getStudent,
  putStudent,
  deleteStudent,
} = require("./student.controller");
const router = express.Router();

router.post("/student", addStudent);
router.get("/students-list", getStudentList);
router.get("/student/:id", getStudent);
router.put("/student/:id", putStudent);
router.delete("/student/:id", deleteStudent);

module.exports = router;

