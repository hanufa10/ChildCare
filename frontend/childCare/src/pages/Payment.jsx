
import { useCallback, useEffect, useMemo, useState } from "react";
import "../components/styles/Payment.css";

const API_URL = "http://localhost:5165/api";

const getValue = (obj, camel, pascal) =>
  obj?.[camel] ?? obj?.[pascal];

const formatETB = (amount) =>
  new Intl.NumberFormat("en-ET", {
    style: "currency",
    currency: "ETB",
    minimumFractionDigits: 2,
  }).format(Number(amount) || 0);

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString();
};

const getStatus = (item) =>
  String(getValue(item, "status", "Status") ?? "Unknown");

const getId = (item) => getValue(item, "id", "Id");

const getFullName = (item) => {
  const first = getValue(item, "firstName", "FirstName") ?? "";
  const last = getValue(item, "lastName", "LastName") ?? "";
  return `${first} ${last}`.trim();
};

async function apiRequest(path, options = {}) {
  const token = localStorage.getItem("authToken");

  if (!token) {
    throw new Error("Please log in again to continue.");
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (response.status === 204) return null;

  const text = await response.text();
  let data = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    const message =
      typeof data === "string"
        ? data
        : data?.message ||
          data?.title ||
          "The request could not be completed.";

    throw new Error(message);
  }

  return data;
}

function Payment() {
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [children, setChildren] = useState([]);
  const [parents, setParents] = useState([]);
    const [parentChildren, setParentChildren] = useState([]);
const [childrenLoading, setChildrenLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [form, setForm] = useState({
    childId: "",
    parentId: "",
    description: "",
    amount: "",
    dueDate: "",
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [invoiceData, paymentData, childData, parentData] =
        await Promise.all([
          apiRequest("/Invoices"),
          apiRequest("/Payments"),
          apiRequest("/Children"),
          apiRequest("/Parent"),
        ]);

      setInvoices(Array.isArray(invoiceData) ? invoiceData : []);
      setPayments(Array.isArray(paymentData) ? paymentData : []);
      setChildren(Array.isArray(childData) ? childData : []);
      setParents(Array.isArray(parentData) ? parentData : []);
    } catch (err) {
      setError(err.message || "Unable to load payment information.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const stats = useMemo(() => {
    const paidInvoices = invoices.filter(
      (invoice) => getStatus(invoice).toLowerCase() === "paid"
    );

    const unpaidInvoices = invoices.filter(
      (invoice) => getStatus(invoice).toLowerCase() === "unpaid"
    );

    const successfulPayments = payments.filter(
      (payment) => getStatus(payment).toLowerCase() === "succeeded"
    );

    const failedPayments = payments.filter(
      (payment) => getStatus(payment).toLowerCase() === "failed"
    );

    return {
      collected: successfulPayments.reduce(
        (total, payment) =>
          total + Number(getValue(payment, "amount", "Amount") || 0),
        0
      ),
      unpaid: unpaidInvoices.reduce(
        (total, invoice) =>
          total + Number(getValue(invoice, "amount", "Amount") || 0),
        0
      ),
      successful: successfulPayments.length,
      failed: failedPayments.length,
    };
  }, [invoices, payments]);

  const filteredPayments = useMemo(() => {
    const term = search.trim().toLowerCase();

    return payments.filter((payment) => {
      const childName =
        getValue(payment, "childName", "ChildName") || "";
      const parentName =
        getValue(payment, "parentName", "ParentName") || "";
      const reference =
        getValue(
          payment,
          "transactionReference",
          "TransactionReference"
        ) || "";
      const method = getValue(payment, "method", "Method") || "";

      const matchesSearch = [
        childName,
        parentName,
        reference,
        method,
      ].some((value) => String(value).toLowerCase().includes(term));

      const matchesStatus =
        statusFilter === "All" ||
        getStatus(payment).toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [payments, search, statusFilter]);

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleCreateInvoice = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const amount = Number(form.amount);

    if (!form.childId || !form.parentId) {
      setError("Please select both a child and a parent.");
      return;
    }

    if (!form.description.trim()) {
      setError("Please enter an invoice description.");
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      setError("The invoice amount must be greater than zero.");
      return;
    }

    if (!form.dueDate) {
      setError("Please select an invoice due date.");
      return;
    }

    setSaving(true);

    try {
      await apiRequest("/Invoices", {
        method: "POST",
        body: JSON.stringify({
          childId: Number(form.childId),
          parentId: Number(form.parentId),
          description: form.description.trim(),
          amount,
          dueDate: new Date(
            `${form.dueDate}T23:59:59`
          ).toISOString(),
        }),
      });

      setSuccess("Invoice created successfully.");

      setForm({
        childId: "",
        parentId: "",
        description: "",
        amount: "",
        dueDate: "",
      });

      await loadData();
    } catch (err) {
      setError(err.message || "Unable to create the invoice.");
    } finally {
      setSaving(false);
    }
  };

  const getPersonName = (list, id) => {
    const person = list.find(
      (item) => String(getId(item)) === String(id)
    );

    return person ? getFullName(person) : `ID ${id}`;
  };

  return (
    <div className="payment-page">
      <div className="payment-page-header">
        <div>
          <p className="payment-eyebrow">FINANCE MANAGEMENT</p>
          <h1>Payments &amp; Invoices</h1>
          <p className="payment-subtitle">
            Manage childcare fees and monitor parent payments.
          </p>
        </div>

        <button
          className="payment-refresh-btn"
          type="button"
          onClick={loadData}
          disabled={loading}
        >
          ↻ {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="payment-alert payment-alert-error" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="payment-alert payment-alert-success" role="status">
          {success}
        </div>
      )}

      <section className="payment-stats">
        <div className="payment-stat-card">
          <div className="payment-stat-icon collected-icon">ETB</div>
          <div>
            <p>Total Collected</p>
            <h2>{formatETB(stats.collected)}</h2>
          </div>
        </div>

        <div className="payment-stat-card">
          <div className="payment-stat-icon unpaid-icon">!</div>
          <div>
            <p>Outstanding Invoices</p>
            <h2>{formatETB(stats.unpaid)}</h2>
          </div>
        </div>

        <div className="payment-stat-card">
          <div className="payment-stat-icon success-icon">✓</div>
          <div>
            <p>Successful Payments</p>
            <h2>{stats.successful}</h2>
          </div>
        </div>

        <div className="payment-stat-card">
          <div className="payment-stat-icon failed-icon">×</div>
          <div>
            <p>Failed Payments</p>
            <h2>{stats.failed}</h2>
          </div>
        </div>
      </section>

      <section className="payment-panel">
        <div className="payment-panel-heading">
          <div>
            <h2>Create Invoice</h2>
            <p>
              Assign a fee to a child and their associated parent.
            </p>
          </div>
        </div>

        <form className="payment-invoice-form" onSubmit={handleCreateInvoice}>

          
<div className="payment-form-field">
  <label htmlFor="payment-parent">Parent</label>
  <select
    id="payment-parent"
    name="parentId"
    value={form.parentId}
    onChange={async (event) => {
      const parentId = event.target.value;

      setForm((previous) => ({
        ...previous,
        parentId,
        childId: "",
      }));

      setParentChildren([]);
      setError("");
      setSuccess("");

      if (!parentId) return;

      setChildrenLoading(true);

      try {
        // Load relationships and keep only this parent's children.
        const relationships = await apiRequest("/ParentChildren");

        const linkedChildren = (Array.isArray(relationships)
          ? relationships
          : []
        ).filter(
          (relationship) =>
            String(
              getValue(relationship, "parentId", "ParentId")
            ) === String(parentId)
        );

        const linkedIds = linkedChildren.map((relationship) =>
          String(getValue(relationship, "childId", "ChildId"))
        );

        setParentChildren(
          children.filter((child) =>
            linkedIds.includes(String(getId(child)))
          )
        );
      } catch (err) {
        setError(err.message || "Unable to load this parent's children.");
      } finally {
        setChildrenLoading(false);
      }
    }}
    required
  >
    <option value="">Select parent</option>
    {parents.map((parent) => (
      <option key={getId(parent)} value={getId(parent)}>
        {getFullName(parent)}
      </option>
    ))}
  </select>
</div>

<div className="payment-form-field">
  <label htmlFor="payment-child">Child</label>
  <select
    id="payment-child"
    name="childId"
    value={form.childId}
    onChange={handleFormChange}
    disabled={!form.parentId || childrenLoading}
    required
  >
    <option value="">
      {childrenLoading
        ? "Loading children..."
        : !form.parentId
          ? "Select a parent first"
          : "Select child"}
    </option>

    {parentChildren.map((child) => (
      <option key={getId(child)} value={getId(child)}>
        {getFullName(child)}
      </option>
    ))}
  </select>
</div>


          <div className="payment-form-field">
            <label htmlFor="payment-description">Description</label>
            <input
              id="payment-description"
              name="description"
              value={form.description}
              onChange={handleFormChange}
              placeholder="e.g. October childcare fee"
              maxLength={150}
              required
            />
          </div>

          <div className="payment-form-field">
            <label htmlFor="payment-amount">Amount (ETB)</label>
            <input
              id="payment-amount"
              name="amount"
              type="number"
              min="0.01"
              step="0.01"
              value={form.amount}
              onChange={handleFormChange}
              placeholder="0.00"
              required
            />
          </div>

          <div className="payment-form-field">
            <label htmlFor="payment-due-date">Due date</label>
            <input
              id="payment-due-date"
              name="dueDate"
              type="date"
              value={form.dueDate}
              onChange={handleFormChange}
              required
            />
          </div>

          <div className="payment-form-actions">
            <button
              className="payment-primary-btn"
              type="submit"
              disabled={saving || loading}
            >
              {saving ? "Creating..." : "+ Create Invoice"}
            </button>
          </div>
        </form>
      </section>

      <section className="payment-panel">
        <div className="payment-panel-heading">
          <div>
            <h2>Invoice Register</h2>
            <p>All invoices issued to parents.</p>
          </div>
          <span className="payment-count">{invoices.length} invoices</span>
        </div>

        {loading ? (
          <div className="payment-state">Loading invoices...</div>
        ) : invoices.length === 0 ? (
          <div className="payment-state">No invoices have been created yet.</div>
        ) : (
          <div className="payment-table-wrap">
            <table className="payment-table">
              <thead>
                <tr>
                  <th>Child</th>
                  <th>Parent</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Due Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => {
                  const id = getId(invoice);
                  const childId = getValue(invoice, "childId", "ChildId");
                  const parentId = getValue(invoice, "parentId", "ParentId");

                  return (
                    <tr key={id}>
                      <td>
                        {getValue(invoice, "childName", "ChildName") ||
                          getPersonName(children, childId)}
                      </td>
                      <td>
                        {getValue(invoice, "parentName", "ParentName") ||
                          getPersonName(parents, parentId)}
                      </td>
                      <td>
                        {getValue(invoice, "description", "Description")}
                      </td>
                      <td className="payment-amount-cell">
                        {formatETB(getValue(invoice, "amount", "Amount"))}
                      </td>
                      <td>
                        {formatDate(getValue(invoice, "dueDate", "DueDate"))}
                      </td>
                      <td>
                        <span
                          className={`payment-status ${getStatus(invoice).toLowerCase()}`}
                        >
                          {getStatus(invoice)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="payment-panel">
        <div className="payment-panel-heading payment-history-heading">
          <div>
            <h2>Payment History</h2>
            <p>Review payment attempts recorded by the system.</p>
          </div>
          <span className="payment-count">{payments.length} records</span>
        </div>

        <div className="payment-toolbar">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search child, parent, reference..."
            aria-label="Search payments"
          />

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filter payment status"
          >
            <option value="All">All statuses</option>
            <option value="Succeeded">Succeeded</option>
            <option value="Failed">Failed</option>
            <option value="Pending">Pending</option>
          </select>
        </div>

        {loading ? (
          <div className="payment-state">Loading payment history...</div>
        ) : filteredPayments.length === 0 ? (
          <div className="payment-state">
            No payment records match your search.
          </div>
        ) : (
          <div className="payment-table-wrap">
            <table className="payment-table">
              <thead>
                <tr>
                  <th>Child</th>
                  <th>Parent</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Transaction Reference</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr key={getId(payment)}>
                    <td>
                      {getValue(payment, "childName", "ChildName") || "—"}
                    </td>
                    <td>
                      {getValue(payment, "parentName", "ParentName") || "—"}
                    </td>
                    <td className="payment-amount-cell">
                      {formatETB(getValue(payment, "amount", "Amount"))}
                    </td>
                    <td>
                      {getValue(payment, "method", "Method") || "—"}
                    </td>
                    <td>
                      <span
                        className={`payment-status ${getStatus(payment).toLowerCase()}`}
                      >
                        {getStatus(payment)}
                      </span>
                    </td>
                    <td className="payment-reference">
                      {getValue(
                        payment,
                        "transactionReference",
                        "TransactionReference"
                      ) || "—"}
                    </td>
                    <td>
                      {formatDate(
                        getValue(payment, "createdAt", "CreatedAt")
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="payment-demo-note">
        Payment results are generated by the backend's mock payment gateway.
        No real money is charged by this demonstration.
      </p>
    </div>
  );
}

export default Payment;
