import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import Swal from "sweetalert2"; // Import SweetAlert2
import "./../styles/Expenses.css";

function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editExpense, setEditExpense] = useState(null); // Stores expense being edited

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const token = localStorage.getItem("userToken");
        const response = await fetch("http://localhost:3000/api/expenses/", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        if (response.ok) {
          setExpenses(data);
        } else {
          setError(data.message);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: data.message,
          });
        }
      } catch (err) {
        setError("Error fetching expenses.");
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Error fetching expenses.",
        });
      }
      setLoading(false);
    };

    fetchExpenses();
  }, []);

  const handleDelete = async (id) => {
    // Confirmation alert before deleting
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("userToken");
        const response = await fetch(`http://localhost:3000/api/expenses/delete/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          setExpenses(expenses.filter((expense) => expense._id !== id));
          Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: "Expense has been deleted.",
          });
        } else {
          setError("Error deleting expense.");
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Error deleting expense.",
          });
        }
      } catch (err) {
        setError("Error deleting expense.");
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Error deleting expense.",
        });
      }
    }
  };

  const handleEdit = (expense) => {
    setEditExpense(expense); // Set the selected expense for editing
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("userToken");
      const response = await fetch(`http://localhost:3000/api/expenses/update/${editExpense._id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editExpense),
      });

      if (response.ok) {
        setExpenses(
          expenses.map((exp) => (exp._id === editExpense._id ? editExpense : exp))
        );
        setEditExpense(null);
        Swal.fire({
          icon: "success",
          title: "Updated!",
          text: "Expense has been updated.",
        });
      } else {
        setError("Error updating expense.");
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Error updating expense.",
        });
      }
    } catch (err) {
      setError("Error updating expense.");
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error updating expense.",
      });
    }
  };

  const handleDownloadBill = (expense) => {
    const doc = new jsPDF();
    doc.text("Expense Bill", 20, 20);
    doc.text(`Item: ${expense.itemName}`, 20, 30);
    doc.text(`Category: ${expense.category}`, 20, 40);
    doc.text(`Quantity: ${expense.quantity}`, 20, 50);
    doc.text(`Price: Rs.${expense.price}`, 20, 60);
    doc.text(`Total Cost: Rs.${expense.totalCost}`, 20, 70);
    doc.save(`${expense.itemName}-bill.pdf`);
  };

  return (
    <div className="expenses-container">
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <div className="expenses-list">
          {expenses.length === 0 ? (
            <p>No expenses recorded.</p>
          ) : (
            expenses.map((expense) => (
              <div key={expense._id} className="expense-card">
                {editExpense && editExpense._id === expense._id ? (
                  <>
                    <input
                      type="text"
                      value={editExpense.itemName}
                      onChange={(e) =>
                        setEditExpense({ ...editExpense, itemName: e.target.value })
                      }
                    />
                    <input
                      type="number"
                      value={editExpense.quantity}
                      onChange={(e) =>
                        setEditExpense({ ...editExpense, quantity: e.target.value })
                      }
                    />
                    <input
                      type="number"
                      value={editExpense.price}
                      onChange={(e) =>
                        setEditExpense({ ...editExpense, price: e.target.value })
                      }
                    />
                    <button onClick={handleUpdate}>Save</button>
                  </>
                ) : (
                  <>
                    <h3>{expense.itemName}</h3>
                    <p>Category: {expense.category}</p>
                    <p>Quantity: {expense.quantity}</p>
                    <p>Price: Rs.{expense.price}</p>
                    <p>Total: Rs.{expense.totalCost}</p>
                    <button onClick={() => handleEdit(expense)}>Edit</button>
                    <button onClick={() => handleDelete(expense._id)}>Delete</button>
                    <button onClick={() => handleDownloadBill(expense)}>Download Bill</button>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default Expenses;