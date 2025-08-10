import { useEffect, useState } from "react";
import Swal from "sweetalert2";

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [limit, setLimit] = useState(10);
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({ name: "", email: "", age: "" });

  const apiUrl = import.meta.env.VITE_API_URL;

  const fetchStudents = async (pageNum = 1, pageLimit = limit) => {
    try {
      const res = await fetch(
        `${apiUrl}/students-list?page=${pageNum}&limit=${pageLimit}`
      );
      if (!res.ok) throw new Error("Failed to fetch students");
      const data = await res.json();
      setStudents(data.students);
      setTotalPages(data.totalPages);
      setPage(data.page);
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  };

  useEffect(() => {
    fetchStudents(page, limit);
    // eslint-disable-next-line
  }, [page, limit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const fetchStudentById = async (id) => {
    try {
      const res = await fetch(`${apiUrl}/student/${id}`);
      if (!res.ok) throw new Error("Failed to fetch student");
      const data = await res.json();
      setForm({
        name: data.name || "",
        email: data.email || "",
        age: data.age !== undefined && data.age !== null ? data.age : "",
      });
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  };

  const handleEdit = async (id) => {
    setEditId(id);
    setShowModal(true);
    await fetchStudentById(id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      Swal.fire("Error", "Name and Email are required", "error");
      return;
    }

    try {
      let res;
      if (editId) {
        res = await fetch(`${apiUrl}/student/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            age: form.age ? Number(form.age) : null,
          }),
        });
      } else {
        res = await fetch(`${apiUrl}/student`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            age: form.age ? Number(form.age) : null,
          }),
        });
      }
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(
          errData.error ||
            (editId ? "Failed to update student" : "Failed to create student")
        );
      }

      await res.json();
      Swal.fire(
        "Success",
        editId ? "Student updated" : "Student added",
        "success"
      );
      setForm({ name: "", email: "", age: "" });
      setShowModal(false);
      setEditId(null);
      fetchStudents(page, limit);
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this record?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    });
    if (result.isConfirmed) {
      try {
        const res = await fetch(`${apiUrl}/student/${id}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to delete student");
        }
        Swal.fire("Deleted!", "Student has been deleted.", "success");
        fetchStudents(page, limit);
      } catch (err) {
        Swal.fire("Error", err.message, "error");
      }
    }
  };

  return (
    <div className="container mt-4">
      <h4 className="mb-3">All Members</h4>
      <div className="border p-3 mb-3 rounded">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <button
            className="btn btn-success"
            onClick={() => {
              setShowModal(true);
              setEditId(null);
              setForm({ name: "", email: "", age: "" });
            }}
          >
            Add New Member
          </button>
        </div>
        <table className="table table-bordered table-hover">
          <thead className="table-light">
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th style={{ width: "80px" }}>Age</th>
              <th style={{ width: "120px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center">
                  No students found
                </td>
              </tr>
            ) : (
              students.map((s) => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td>{s.email}</td>
                  <td>{s.age ?? "-"}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-primary me-2"
                      title="Edit"
                      onClick={() => handleEdit(s.id)}
                    >
                      {/* Pencil (edit) SVG */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        viewBox="0 0 16 16"
                      >
                        <path d="M12.146.854a.5.5 0 0 1 .708 0l2.292 2.292a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-4 1.5a.5.5 0 0 1-.65-.65l1.5-4a.5.5 0 0 1 .11-.168l10-10zm.708-.708a1.5 1.5 0 0 0-2.121 0l-10 10a1.5 1.5 0 0 0-.329.497l-1.5 4A1.5 1.5 0 0 0 2.5 16a1.5 1.5 0 0 0 .497-.329l4-1.5a1.5 1.5 0 0 0 .497-.329l10-10a1.5 1.5 0 0 0 0-2.121l-2.292-2.292z" />
                      </svg>
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      title="Delete"
                      onClick={() => handleDelete(s.id)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        viewBox="0 0 16 16"
                      >
                        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5.5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6zm2 .5a.5.5 0 0 1 .5-.5.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6z" />
                        <path
                          fillRule="evenodd"
                          d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1 0-2h3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3a1 1 0 0 1 1 1zm-11-1a.5.5 0 0 0-.5.5V4h11V2.5a.5.5 0 0 0-.5-.5h-10zM12 4H4v9a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4z"
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="d-flex justify-content-between align-items-center">
          <div>
            Show{" "}
            <input
              type="number"
              min="1"
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value) || 1);
                setPage(1);
              }}
              style={{ width: 60, display: "inline-block" }}
              className="form-control d-inline-block"
            />{" "}
            entries
          </div>
          <nav>
            <ul className="pagination mb-0">
              <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                <button
                  className="page-link"
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                >
                  First
                </button>
              </li>
              <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                <button
                  className="page-link"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </button>
              </li>
              {[...Array(totalPages)].map((_, i) => (
                <li
                  key={i}
                  className={`page-item ${page === i + 1 ? "active" : ""}`}
                >
                  <button className="page-link" onClick={() => setPage(i + 1)}>
                    {i + 1}
                  </button>
                </li>
              ))}
              <li
                className={`page-item ${page === totalPages ? "disabled" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                >
                  Next
                </button>
              </li>
              <li
                className={`page-item ${page === totalPages ? "disabled" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => setPage(totalPages)}
                  disabled={page === totalPages}
                >
                  Last
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
      {showModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => {
            setShowModal(false);
            setEditId(null);
          }}
        >
          <div
            className="modal-dialog"
            role="document"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editId ? "Edit Student" : "Add Student"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={() => {
                    setShowModal(false);
                    setEditId(null);
                  }}
                />
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email *</label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Age</label>
                    <input
                      type="number"
                      className="form-control"
                      name="age"
                      value={form.age}
                      onChange={handleChange}
                      min="0"
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowModal(false);
                      setEditId(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editId ? "Update Student" : "Add Student"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentList;
