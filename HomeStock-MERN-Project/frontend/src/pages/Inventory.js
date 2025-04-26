import Layout from "../components/Layout";
import { useEffect, useState } from "react";
import "../styles/inventory.css";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable";

function Inventory() {
  const [items, setItems] = useState([]);
  const [editItem, setEditItem] = useState(null);
  const [newItem, setNewItem] = useState({
    itemName: "",
    quantity: "",
    category: "",
    expiryDate: "",
    price: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Predefined kitchen categories
  const kitchenCategories = [
    "Grains & Cereals",
    "Spices & Condiments",
    "Dairy & Eggs",
    "Fruits & Vegetables",
    "Meat & Poultry",
    "Beverages",
    "Baking Supplies",
    "Canned Goods",
    "Snacks",
    "Cleaning Supplies"
  ];

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    const token = localStorage.getItem("userToken");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:3000/api/inventory/", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (response.ok) {
        setItems(data);
      } else {
        Swal.fire({
          title: "Error!",
          text: data.message,
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    } catch (error) {
      console.error("Error fetching inventory:", error);
      Swal.fire({
        title: "Error!",
        text: "An error occurred while fetching inventory. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrUpdateItem = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("userToken");

    // Check for empty fields
    if (!newItem.itemName || !newItem.quantity || !newItem.category || !newItem.price) {
      Swal.fire({
        title: "Error!",
        text: "Please fill in all required fields.",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    // Validate quantity and price
    if (newItem.quantity < 0 || newItem.price < 0) {
      Swal.fire({
        title: "Error!",
        text: "Quantity and price must be non-negative numbers.",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    // Check if expiry date is in the past (only if expiry date is provided)
    if (newItem.expiryDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time part to compare dates only
      const selectedDate = new Date(newItem.expiryDate);
      
      if (selectedDate < today) {
        Swal.fire({
          title: "Invalid Expiry Date!",
          text: "You have selected a past date. Please choose a current or future date.",
          icon: "error",
          confirmButtonText: "OK",
        });
        return;
      }
    }

    if (editItem) {
      // Update existing item
      try {
        const response = await fetch(`http://localhost:3000/api/inventory/update/${editItem._id}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newItem),
        });

        const data = await response.json();
        if (response.ok) {
          Swal.fire({
            title: "Success!",
            text: "Item updated successfully!",
            icon: "success",
            confirmButtonText: "OK",
          });
          setItems(items.map(item => (item._id === editItem._id ? data.item : item)));
          setEditItem(null);
        } else {
          Swal.fire({
            title: "Error!",
            text: data.message,
            icon: "error",
            confirmButtonText: "OK",
          });
        }
      } catch (error) {
        console.error("Error updating item:", error);
        Swal.fire({
          title: "Error!",
          text: "An error occurred while updating the item. Please try again.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    } else {
      // Add new item
      try {
        const response = await fetch("http://localhost:3000/api/inventory/add", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newItem),
        });

        const data = await response.json();
        if (response.ok) {
          Swal.fire({
            title: "Success!",
            text: "Item added successfully!",
            icon: "success",
            confirmButtonText: "OK",
          });
          setItems([...items, data.newItem]);
        } else {
          Swal.fire({
            title: "Error!",
            text: data.message,
            icon: "error",
            confirmButtonText: "OK",
          });
        }
      } catch (error) {
        console.error("Error adding item:", error);
        Swal.fire({
          title: "Error!",
          text: "An error occurred while adding the item. Please try again.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    }

    // Reset form
    setNewItem({ itemName: "", quantity: "", category: "", expiryDate: "", price: "" });
  };

  const handleEditItem = (item) => {
    setEditItem(item);
    setNewItem({
      itemName: item.itemName,
      quantity: item.quantity,
      category: item.category,
      expiryDate: item.expiryDate ? item.expiryDate.split("T")[0] : "",
      price: item.price,
    });
  };

  const handleDeleteItem = async (itemId) => {
    const token = localStorage.getItem("userToken");

    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to undo this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(`http://localhost:3000/api/inventory/delete/${itemId}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          const data = await response.json();
          if (response.ok) {
            Swal.fire("Deleted!", "The item has been deleted.", "success");
            setItems(items.filter((item) => item._id !== itemId));
          } else {
            Swal.fire("Error!", data.message, "error");
          }
        } catch (error) {
          console.error("Error deleting item:", error);
          Swal.fire("Error!", "Something went wrong!", "error");
        }
      }
    });
  };

  const handleConsumeItem = async (itemId) => {
    const token = localStorage.getItem("userToken");
    const itemToConsume = items.find((item) => item._id === itemId);

    // Check if the item has a quantity greater than 0
    if (itemToConsume.quantity <= 0) {
      Swal.fire({
        title: "Error!",
        text: "This item is out of stock.",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/inventory/consume/${itemId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (response.ok) {
        Swal.fire({
          title: "Item Consumed!",
          text: "The item quantity has been reduced.",
          icon: "success",
          confirmButtonText: "OK",
        });
        setItems(items.map((item) => (item._id === itemId ? { ...item, quantity: item.quantity - 1 } : item)));
      } else {
        Swal.fire({
          title: "Error!",
          text: data.message,
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    } catch (error) {
      console.error("Error consuming item:", error);
      Swal.fire({
        title: "Error!",
        text: "An error occurred while consuming the item. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  // Function to generate and download a PDF report
  const generatePDFReport = () => {
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(18);
    doc.text("Inventory Report", 10, 10);

    // Define table columns
    const columns = ["Item Name", "Quantity", "Category", "Expiry Date", "Price"];

    // Map inventory data to rows
    const rows = items.map((item) => [
      item.itemName,
      item.quantity,
      item.category,
      item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : "N/A",
      `R.S ${item.price}`,
    ]);

    // Add table to PDF
    doc.autoTable({
      head: [columns],
      body: rows,
      startY: 20, // Start table below the title
    });

    // Save the PDF
    doc.save("inventory_report.pdf");
  };

  return (
    <Layout>
      <div className="inventory-container">
        <h2>Inventory Management</h2>

        <form className="inventory-form" onSubmit={handleAddOrUpdateItem}>
          <input 
            type="text" 
            placeholder="Item Name" 
            required 
            value={newItem.itemName} 
            onChange={(e) => setNewItem({ ...newItem, itemName: e.target.value })} 
          />
          <input 
            type="number" 
            placeholder="Quantity" 
            required 
            min="0" 
            value={newItem.quantity} 
            onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })} 
          />
          
          {/* Category Dropdown */}
          <select
            required
            value={newItem.category}
            onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
            className="category-select"
          >
            <option value="">Select a category</option>
            {kitchenCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          
          <input 
            type="date" 
            placeholder="Expiry Date" 
            value={newItem.expiryDate} 
            onChange={(e) => setNewItem({ ...newItem, expiryDate: e.target.value })} 
          />
          <input 
            type="number" 
            placeholder="Price" 
            required 
            min="0" 
            value={newItem.price} 
            onChange={(e) => setNewItem({ ...newItem, price: e.target.value })} 
          />
          
          <div className="form-actions">
            <button type="submit" className="submit-btn">
              {editItem ? "Update Item" : "Add Item"}
            </button>
            <button 
              type="button" 
              onClick={generatePDFReport} 
              className="generate-report-btn"
            >
              Generate Report
            </button>
          </div>
        </form>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="inventory-grid">
            {items.map((item) => (
              <div key={item._id} className="inventory-item">
                <h3>{item.itemName}</h3>
                <p><strong>Quantity:</strong> {item.quantity}</p>
                <p><strong>Category:</strong> {item.category}</p>
                <p><strong>Expiry:</strong> {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : "N/A"}</p>
                <p><strong>Price:</strong> R.S {item.price}</p>
                <div className="inventory-buttons">
                  <button className="edit-btn" onClick={() => handleEditItem(item)}>Edit</button>
                  <button className="consume-btn" onClick={() => handleConsumeItem(item._id)}>Consume</button>
                  <button className="delete-btn" onClick={() => handleDeleteItem(item._id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Inventory;