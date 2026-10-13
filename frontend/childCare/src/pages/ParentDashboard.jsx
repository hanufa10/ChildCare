import { useCallback, useEffect, useMemo, useState } from "react";
import "../components/styles/ParentDashboard.css";
import {
  LayoutDashboard,
  Baby,
  Utensils,
  CalendarCheck,
  Megaphone,
  MessageSquare,
  CreditCard,
} from "lucide-react";

const API_URL = "http://localhost:5165/api";

const navItems = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "children", label: "My Children", icon: Baby },
  { id: "meals", label: "Meal Schedule", icon: Utensils },
  { id: "attendance", label: "Attendance", icon: CalendarCheck },
  { id: "announcements", label: "Announcements", icon: Megaphone },
  { id: "complaints", label: "Complaints", icon: MessageSquare },
  { id: "payments", label: "Payments", icon: CreditCard },
];

const mealTypeLabels = {
  0: "Breakfast",
  1: "Lunch",
  2: "Snack",
  breakfast: "Breakfast",
  lunch: "Lunch",
  snack: "Snack",
};

const mealTypeIcons = {
  Breakfast: "🌅",
  Lunch: "🍲",
  Snack: "🍎",
};

function getValue(object, camelCase, pascalCase) {
  return object?.[camelCase] ?? object?.[pascalCase];
}

function getMealType(type) {
  if (typeof type === "number") {
    return mealTypeLabels[type] || "Other";
  }

  const normalized = String(type ?? "").toLowerCase();

  return mealTypeLabels[normalized] || "Other";
}

function getChildFromRelationship(relationship) {
  return getValue(relationship, "child", "Child") ?? relationship;
}

function getChildId(child) {
  return getValue(child, "id", "Id");
}

function getChildName(child) {
  const firstName = getValue(child, "firstName", "FirstName") || "";
  const lastName = getValue(child, "lastName", "LastName") || "";

  return `${firstName} ${lastName}`.trim() || "Child";
}

function getDateOfBirth(child) {
  return getValue(child, "dateOfBirth", "DateOfBirth");
}

function calculateAge(dateOfBirth) {
  if (!dateOfBirth) return null;

  const birthDate = new Date(`${String(dateOfBirth).slice(0, 10)}T00:00:00`);

  if (Number.isNaN(birthDate.getTime())) return null;

  const today = new Date();

  if (birthDate > today) return null;

  let age = today.getFullYear() - birthDate.getFullYear();

  const birthdayHasNotOccurred =
    today.getMonth() < birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() &&
      today.getDate() < birthDate.getDate());

  if (birthdayHasNotOccurred) age--;

  return age;
}

function formatDate(dateValue) {
  if (!dateValue) return "Date not available";

  const date = new Date(`${String(dateValue).slice(0, 10)}T00:00:00`);

  if (Number.isNaN(date.getTime())) return String(dateValue);

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

async function fetchApi(path, token, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  
  if (!response.ok) {
    let message = `Request failed (${response.status}).`;

    try {
      const errorBody = await response.json();

      if (errorBody.errors) {
        message = Object.entries(errorBody.errors)
          .map(([field, messages]) => {
            const details = Array.isArray(messages)
              ? messages.join(", ")
              : String(messages);

            return `${field}: ${details}`;
          })
          .join("\n");
      } else {
        message =
          errorBody.message ||
          errorBody.title ||
          errorBody.detail ||
          message;
      }
    } catch {
      // The API may return an empty or non-JSON response.
    }

    if (response.status === 401) {
      message = "Your session may have expired. Please log in again.";
    } else if (response.status === 403) {
      message = "You do not have permission to perform this action.";
    } else if (response.status === 404) {
      message = "The requested API endpoint was not found.";
    }

    console.error("API request failed:", {
      path,
      status: response.status,
      message,
    });

    throw new Error(message);
  }


  if (response.status === 204) return null;

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  return null;
}

function ParentDashboard() {
  const [activePage, setActivePage] = useState("overview");
  const [selectedDate, setSelectedDate] = useState("all");
  
const [invoices, setInvoices] = useState([]);
const [payments, setPayments] = useState([]);

const [paymentsLoading, setPaymentsLoading] = useState(true);
const [paymentsError, setPaymentsError] = useState("");
const [paymentMessage, setPaymentMessage] = useState("");
const [payingInvoiceId, setPayingInvoiceId] = useState(null);

  
  const [user] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("authUser") || "null");
    } catch {
      return null;
    }
  });

  const token = localStorage.getItem("authToken");
  
const [profile, setProfile] = useState(() => {
  const savedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("authUser") || "{}");
    } catch {
      return {};
    }
  })();

  return {
    firstName: savedUser.firstName || savedUser.FirstName || "",
    lastName: savedUser.lastName || savedUser.LastName || "",
    email: savedUser.email || savedUser.Email || "",
    phoneNumber: savedUser.phoneNumber || savedUser.PhoneNumber || "",
  };
});

const [isEditingProfile, setIsEditingProfile] = useState(false);
const [profileMessage, setProfileMessage] = useState("");


  const [children, setChildren] = useState([]);
  const [meals, setMeals] = useState([]);

  const [childrenLoading, setChildrenLoading] = useState(true);
  const [mealsLoading, setMealsLoading] = useState(true);

  const [childrenError, setChildrenError] = useState("");
  const [mealsError, setMealsError] = useState("");

  const [refreshKey, setRefreshKey] = useState(0);

  const [editingChild, setEditingChild] = useState(null);
  const [savingChild, setSavingChild] = useState(false);
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");

  const [announcements, setAnnouncements] = useState([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(true);
  const [announcementsError, setAnnouncementsError] = useState("");

  const [complaints, setComplaints] = useState([]);
  const [complaintsLoading, setComplaintsLoading] = useState(true);
  const [complaintsError, setComplaintsError] = useState("");

  const [complaintSubject, setComplaintSubject] = useState("");
  const [complaintDescription, setComplaintDescription] = useState("");
  const [complaintSubmitting, setComplaintSubmitting] = useState(false);
  const [complaintSuccess, setComplaintSuccess] = useState("");

  
const parentName =
  `${profile.firstName} ${profile.lastName}`.trim() ||
  user?.name ||
  user?.Name ||
  "Parent";

  const loadChildren = useCallback(async () => {
    setChildrenLoading(true);
    setChildrenError("");

    try {
      if (!token) {
        throw new Error("Please log in to view your children's information.");
      }

      const data = await fetchApi("/ParentChildren/my-children", token);

      const relationships = Array.isArray(data) ? data : [];

      const actualChildren = relationships
        .map(getChildFromRelationship)
        .filter((child) => child && getChildId(child) != null);

      // Avoid displaying duplicate children if the API returns
      // more than one relationship record for the same child.
      const uniqueChildren = [
        ...new Map(
          actualChildren.map((child) => [getChildId(child), child]),
        ).values(),
      ];

      setChildren(uniqueChildren);
    } catch (error) {
      setChildren([]);
      setChildrenError(
        error.message || "Unable to load children's information.",
      );
    } finally {
      setChildrenLoading(false);
    }
  }, [token]);
  const loadAnnouncements = useCallback(async () => {
  setAnnouncementsLoading(true);
  setAnnouncementsError("");

  try {
    if (!token) {
      throw new Error("Please log in to view announcements.");
    }

    const data = await fetchApi("/Announcements", token);
    setAnnouncements(Array.isArray(data) ? data : []);
  } catch (error) {
    setAnnouncements([]);
    setAnnouncementsError(
      error.message || "Unable to load announcements."
    );
  } finally {
    setAnnouncementsLoading(false);
  }
}, [token]);
useEffect(() => {
  loadAnnouncements();
}, [loadAnnouncements, refreshKey]);


const loadPayments = useCallback(async () => {
  setPaymentsLoading(true);
  setPaymentsError("");

  try {
    if (!token) {
      throw new Error("Please log in to view your payments.");
    }

    const [invoiceData, paymentData] = await Promise.all([
      fetchApi("/Invoices/mine", token),
      fetchApi("/Payments/mine", token),
    ]);

    setInvoices(Array.isArray(invoiceData) ? invoiceData : []);
    setPayments(Array.isArray(paymentData) ? paymentData : []);
  } catch (error) {
    setPaymentsError(
      error.message || "Unable to load your payment information."
    );
  } finally {
    setPaymentsLoading(false);
  }
}, [token]);

useEffect(() => {
  loadPayments();
}, [loadPayments, refreshKey]);

const handleMockPayment = async (invoice, method) => {
  const invoiceId = getValue(invoice, "id", "Id");

  if (!invoiceId || payingInvoiceId !== null) return;

  setPayingInvoiceId(invoiceId);
  setPaymentMessage("");
  setPaymentsError("");

  try {
    const result = await fetchApi("/Payments/initiate", token, {
      method: "POST",
      body: JSON.stringify({
        invoiceId,
        // The backend enum is:
        // MockMobileMoney = 0, MockCard = 1.
        method,
      }),
    });

    const status = getValue(result, "status", "Status");
    const message = getValue(result, "message", "Message");

    setPaymentMessage(
      message ||
        (status === "Succeeded"
          ? "Mock payment successful."
          : "Payment attempt completed.")
    );

    await loadPayments();
  } catch (error) {
    setPaymentsError(
      error.message || "Unable to process the mock payment."
    );
  } finally {
    setPayingInvoiceId(null);
  }
};

  const loadMeals = useCallback(async () => {
    setMealsLoading(true);
    setMealsError("");

    try {
      const data = await fetchApi("/Meal", token);

      setMeals(Array.isArray(data) ? data : []);
    } catch (error) {
      setMeals([]);
      setMealsError(error.message || "Unable to load the meal schedule.");
    } finally {
      setMealsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadChildren();
    loadMeals();
  }, [loadChildren, loadMeals, refreshKey]);

  const sortedMeals = useMemo(() => {
    return [...meals].sort((a, b) => {
      const dateA = String(getValue(a, "date", "Date") || "");
      const dateB = String(getValue(b, "date", "Date") || "");

      if (dateA !== dateB) return dateA.localeCompare(dateB);

      return getMealType(getValue(a, "type", "Type")).localeCompare(
        getMealType(getValue(b, "type", "Type")),
      );
    });
  }, [meals]);

  const mealDates = useMemo(() => {
    return [
      ...new Set(
        sortedMeals
          .map((meal) => {
            const date = getValue(meal, "date", "Date");
            return date ? String(date).slice(0, 10) : "";
          })
          .filter(Boolean),
      ),
    ].sort();
  }, [sortedMeals]);

  const filteredMeals = useMemo(() => {
    if (selectedDate === "all") return sortedMeals;

    return sortedMeals.filter(
      (meal) =>
        String(getValue(meal, "date", "Date") || "").slice(0, 10) ===
        selectedDate,
    );
  }, [selectedDate, sortedMeals]);

  const today = getLocalDateString();

  const nextMeal = useMemo(() => {
    return (
      sortedMeals.find((meal) => {
        const date = String(getValue(meal, "date", "Date") || "").slice(0, 10);
        return date >= today;
      }) || null
    );
  }, [sortedMeals, today]);

  const todayMeals = useMemo(() => {
    return sortedMeals.filter(
      (meal) =>
        String(getValue(meal, "date", "Date") || "").slice(0, 10) === today,
    );
  }, [sortedMeals, today]);

  const pageTitle =
    navItems.find((item) => item.id === activePage)?.label || "Overview";

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    window.location.replace("/login");
  };

  const retryLoading = () => {
    setRefreshKey((current) => current + 1);
  };

  const styles = {
    card: "pc-card",
    sectionTitle: "pc-section-title",
    muted: "pc-muted",
  };

  const renderLoading = (message) => (
    <div className="pc-message" role="status">
      <span className="pc-spinner" aria-hidden="true" />
      {message}
    </div>
  );

  const renderError = (message, retry) => (
    <div className="pc-error" role="alert">
      <p>{message}</p>
      <button className="pc-button pc-button-secondary" onClick={retry}>
        Try again
      </button>
    </div>
  );

  const renderEmpty = (message) => (
    <div className="pc-empty">
      <span className="pc-empty-icon" aria-hidden="true">
        🌿
      </span>
      <p>{message}</p>
    </div>
  );
  
const renderPayments = () => {
  const unpaidInvoices = invoices.filter(
    (invoice) =>
      String(getValue(invoice, "status", "Status"))
        .toLowerCase() === "unpaid"
  );

  const totalOutstanding = unpaidInvoices.reduce(
    (total, invoice) =>
      total + Number(getValue(invoice, "amount", "Amount") || 0),
    0
  );

  const formatMoney = (amount) =>
    new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "ETB",
    }).format(Number(amount || 0));

  return (
    <section className="pc-payments-page">
      <div className="pc-card pc-payments-summary">
        <div>
          <p className="pc-muted">Outstanding balance</p>
          <h2>{formatMoney(totalOutstanding)}</h2>
          <p className="pc-muted">
            {unpaidInvoices.length} unpaid{" "}
            {unpaidInvoices.length === 1 ? "invoice" : "invoices"}
          </p>
        </div>
        <div className="pc-payment-summary-icon" aria-hidden="true">
          💳
        </div>
      </div>

      {paymentMessage && (
        <p className="pc-edit-success" role="status">
          {paymentMessage}
        </p>
      )}

      {paymentsError && (
        <div className="pc-error" role="alert">
          <p>{paymentsError}</p>
          <button
            type="button"
            className="pc-button pc-button-secondary"
            onClick={loadPayments}
          >
            Try again
          </button>
        </div>
      )}

      <section className="pc-card">
        <h2 className={styles.sectionTitle}>Outstanding Invoices</h2>
        <p className="pc-muted pc-section-description">
          Review your daycare fees and choose a mock payment method.
        </p>

        {paymentsLoading ? (
          renderLoading("Loading invoices...")
        ) : unpaidInvoices.length === 0 ? (
          renderEmpty("You have no outstanding invoices.")
        ) : (
          <div className="pc-payment-list">
            {unpaidInvoices.map((invoice) => {
              const id = getValue(invoice, "id", "Id");
              const childName =
                getValue(invoice, "childName", "ChildName") || "Child";
              const description =
                getValue(invoice, "description", "Description") ||
                "Daycare fee";
              const amount = getValue(invoice, "amount", "Amount");
              const dueDate = getValue(invoice, "dueDate", "DueDate");
              const isPaying = payingInvoiceId === id;

              return (
                <article className="pc-payment-card" key={id}>
                  <div className="pc-payment-card-top">
                    <div>
                      <span className="pc-payment-label">
                        INVOICE #{id}
                      </span>
                      <h3>{description}</h3>
                      <p className="pc-muted">
                        Child: {childName}
                      </p>
                      <p className="pc-muted">
                        Due: {formatDate(dueDate)}
                      </p>
                    </div>

                    <div className="pc-payment-amount">
                      {formatMoney(amount)}
                    </div>
                  </div>

                  <div className="pc-payment-actions">
                    <button
                      type="button"
                      className="pc-button pc-button-primary"
                      disabled={payingInvoiceId !== null}
                      onClick={() => handleMockPayment(invoice, 0)}
                    >
                      {isPaying
                        ? "Processing..."
                        : "📱 Mock Mobile Money"}
                    </button>

                    <button
                      type="button"
                      className="pc-button pc-button-secondary"
                      disabled={payingInvoiceId !== null}
                      onClick={() => handleMockPayment(invoice, 1)}
                    >
                      💳 Mock Card
                    </button>
                  </div>

                  <p className="pc-payment-disclaimer">
                    Demonstration only. No real money will be charged.
                  </p>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="pc-card pc-payment-history">
        <div className="pc-card-heading">
          <div>
            <h2 className={styles.sectionTitle}>Payment History</h2>
            <p className="pc-muted">
              Your previous payment attempts and their results.
            </p>
          </div>

          <button
            type="button"
            className="pc-button pc-button-secondary"
            onClick={loadPayments}
            disabled={paymentsLoading}
          >
            ↻ Refresh
          </button>
        </div>

        {paymentsLoading ? (
          renderLoading("Loading payment history...")
        ) : payments.length === 0 ? (
          renderEmpty("You have no payment history yet.")
        ) : (
          <div className="pc-payment-history-list">
            {payments.map((payment) => {
              const id = getValue(payment, "id", "Id");
              const description =
                getValue(
                  payment,
                  "invoiceDescription",
                  "InvoiceDescription"
                ) || `Invoice #${getValue(payment, "invoiceId", "InvoiceId")}`;
              const childName =
                getValue(payment, "childName", "ChildName") || "Child";
              const amount = getValue(payment, "amount", "Amount");
              const method = getValue(payment, "method", "Method");
              const status = getValue(payment, "status", "Status");
              const reference = getValue(
                payment,
                "transactionReference",
                "TransactionReference"
              );
              const createdAt = getValue(
                payment,
                "createdAt",
                "CreatedAt"
              );
              const failureReason = getValue(
                payment,
                "failureReason",
                "FailureReason"
              );

              return (
                <article className="pc-payment-history-item" key={id}>
                  <div className="pc-payment-history-main">
                    <h3>{description}</h3>
                    <p className="pc-muted">{childName}</p>
                    <p className="pc-muted">
                      {formatDate(createdAt)} ·{" "}
                      {method === "0"
                        ? "Mock Mobile Money"
                        : method === "1"
                          ? "Mock Card"
                          : method || "Payment method"}
                    </p>
                    {reference && (
                      <p className="pc-payment-reference">
                        Reference: {reference}
                      </p>
                    )}
                    {failureReason && (
                      <p className="pc-payment-failure">
                        {failureReason}
                      </p>
                    )}
                  </div>

                  <div className="pc-payment-history-end">
                    <strong>{formatMoney(amount)}</strong>
                    <span
                      className={`pc-payment-status ${String(status || "Pending")
                        .toLowerCase()}`}
                    >
                      {status || "Pending"}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </section>
  );
};

  const renderMealList = (items) => {
    if (mealsLoading) return renderLoading("Loading meals...");

    if (mealsError) {
      return renderError(mealsError, loadMeals);
    }

    if (items.length === 0) {
      return renderEmpty("No meals have been scheduled for this date yet.");
    }

    return (
      <div className="pc-meal-list">
        {items.map((meal) => {
          const id = getValue(meal, "id", "Id");
          const name = getValue(meal, "name", "Name") || "Unnamed meal";
          const date = getValue(meal, "date", "Date");
          const type = getMealType(getValue(meal, "type", "Type"));
          const description =
            getValue(meal, "description", "Description") || "";

          return (
            <article
              className="pc-meal-item"
              key={id ?? `${date}-${type}-${name}`}
            >
              <div className="pc-meal-icon" aria-hidden="true">
                {mealTypeIcons[type] || "🍽️"}
              </div>

              <div className="pc-meal-info">
                <span className="pc-meal-type">{type}</span>
                <h4>{name}</h4>
                {description && <p>{description}</p>}
                <span className="pc-meal-date">{formatDate(date)}</span>
              </div>
            </article>
          );
        })}
      </div>
    );
  };

  const renderOverview = () => (
    <>
      <section className="pc-hero">
        <div className="pc-hero-content">
          <p className="pc-eyebrow">YOUR FAMILY PORTAL</p>
          <h2>Welcome back, {parentName}! 👋</h2>
          <p>
            Stay connected with your children's information, meal schedules, and
            important daycare updates.
          </p>
          <button
            className="pc-button pc-button-primary pc-hero-button"
            onClick={() => setActivePage("children")}
          >
            View my children →
          </button>
        </div>
        <div className="pc-hero-illustration" aria-hidden="true">
          🧸
        </div>
      </section>

      <section className="pc-stats-grid" aria-label="Dashboard summary">
        <article className="pc-stat-card">
          <div className="pc-stat-icon pc-stat-green">👧</div>
          <p className="pc-stat-label">My Children</p>
          <p className="pc-stat-value">
            {childrenLoading ? "—" : childrenError ? "—" : children.length}
          </p>
          <p className="pc-stat-detail">
            {childrenLoading
              ? "Loading..."
              : childrenError
                ? "Unavailable"
                : children.length === 1
                  ? "Registered child"
                  : "Registered children"}
          </p>
        </article>

        <article className="pc-stat-card">
          <div className="pc-stat-icon pc-stat-teal">✓</div>
          <p className="pc-stat-label">Attendance</p>
          <p className="pc-stat-value pc-stat-value-text">Not connected</p>
          <p className="pc-stat-detail">Attendance API not available yet</p>
        </article>

        <article className="pc-stat-card">
          <div className="pc-stat-icon pc-stat-orange">🍽️</div>
          <p className="pc-stat-label">Next Meal</p>
          <p className="pc-stat-value pc-stat-value-text">
            {mealsLoading
              ? "Loading..."
              : mealsError
                ? "Unavailable"
                : nextMeal
                  ? getValue(nextMeal, "name", "Name") ||
                    getMealType(getValue(nextMeal, "type", "Type"))
                  : "Not scheduled"}
          </p>
          <p className="pc-stat-detail">
            {nextMeal
              ? `${getMealType(getValue(nextMeal, "type", "Type"))} · ${formatDate(getValue(nextMeal, "date", "Date"))}`
              : "Based on the published meal schedule"}
          </p>
        </article>

        <article className="pc-stat-card">
          <div className="pc-stat-icon pc-stat-purple">📣</div>
          <p className="pc-stat-label">Announcements</p>
          <p className="pc-stat-value pc-stat-value-text">Not connected</p>
          <p className="pc-stat-detail">Announcements API not available yet</p>
        </article>
      </section>

      <section className="pc-overview-grid">
        <article className={styles.card}>
          <div className="pc-card-heading">
            <h3 className={styles.sectionTitle}>My Children</h3>
            <button
              className="pc-button pc-button-secondary"
              onClick={() => setActivePage("children")}
            >
              View details
            </button>
          </div>

          {childrenLoading ? (
            renderLoading("Loading children's information...")
          ) : childrenError ? (
            renderError(childrenError, loadChildren)
          ) : children.length === 0 ? (
            renderEmpty("No children are linked to your parent account yet.")
          ) : (
            <div className="pc-child-list">
              {children.slice(0, 3).map((child) => {
                const id = getChildId(child);
                const name = getChildName(child);
                const age = calculateAge(getDateOfBirth(child));

                return (
                  <div className="pc-child-summary" key={id}>
                    <div className="pc-child-avatar" aria-hidden="true">
                      👧
                    </div>
                    <div className="pc-child-info">
                      <h4>{name}</h4>
                      <p>
                        {age == null
                          ? "Age not available"
                          : `${age} ${age === 1 ? "year" : "years"} old`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="pc-note pc-note-green">
            Your child's information is loaded from your parent account.
          </div>
        </article>

        <article className={styles.card}>
          <div className="pc-card-heading">
            <h3 className={styles.sectionTitle}>Today's Meals</h3>
            <button
              className="pc-button pc-button-secondary"
              onClick={() => setActivePage("meals")}
            >
              Full menu
            </button>
          </div>

          <p className="pc-muted pc-section-description">{formatDate(today)}</p>

          {renderMealList(todayMeals)}
        </article>

        <article className={styles.card}>
          <h3 className={styles.sectionTitle}>Latest Announcements</h3>
          {renderEmpty(
            "Announcements will appear here when an announcements API is available.",
          )}
          <button
            className="pc-button pc-button-secondary"
            onClick={() => setActivePage("announcements")}
          >
            View announcements →
          </button>
        </article>
      </section>
    </>
  );

  const openEditChild = (child) => {
    setEditingChild({
      id: getChildId(child),
      firstName: getValue(child, "firstName", "FirstName") || "",
      lastName: getValue(child, "lastName", "LastName") || "",
      dateOfBirth: String(getDateOfBirth(child) || "").slice(0, 10),
      gender: getValue(child, "gender", "Gender") || "",
      allergies: getValue(child, "allergies", "Allergies") || "",
      healthCondition:
        getValue(child, "healthCondition", "HealthCondition") || "",
    });

    setEditError("");
    setEditSuccess("");
  };

  const handleEditFieldChange = (event) => {
    const { name, value } = event.target;

    setEditingChild((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const saveChildChanges = async (event) => {
    event.preventDefault();

    if (!editingChild || savingChild) return;

    setSavingChild(true);
    setEditError("");
    setEditSuccess("");

    try {
      if (!token) {
        throw new Error("Please log in again before saving changes.");
      }

      const childId = editingChild.id;

      // Match these property names to your C# Child model.
      const payload = {
        id: childId,
        firstName: editingChild.firstName.trim(),
        lastName: editingChild.lastName.trim(),
        dateOfBirth: editingChild.dateOfBirth,
        gender: editingChild.gender,
        allergies: editingChild.allergies.trim(),
        healthCondition: editingChild.healthCondition.trim(),
      };

      await fetchApi(`/Children/${childId}`, token, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      setChildren((current) =>
        current.map((child) =>
          getChildId(child) === childId ? { ...child, ...payload } : child,
        ),
      );

      setEditingChild(null);
      setEditSuccess("Child information updated successfully.");
    } catch (error) {
      setEditError(error.message || "Unable to save child information.");
    } finally {
      setSavingChild(false);
    }
  };

  const renderChildren = () => (
    <section className="pc-children-page">
      <div className="pc-children-page-heading">
        <div>
          <h2 className={styles.sectionTitle}>My Children</h2>
          <p className="pc-muted pc-section-description">
            View your children's personal, health, and registration information.
          </p>
        </div>

        <div className="pc-children-count">
          {childrenLoading
            ? "Loading..."
            : `${children.length} ${children.length === 1 ? "child" : "children"}`}
        </div>
      </div>

      {childrenLoading ? (
        renderLoading("Loading children's information...")
      ) : childrenError ? (
        renderError(childrenError, loadChildren)
      ) : children.length === 0 ? (
        renderEmpty("No children are linked to your parent account yet.")
      ) : (
        <div className="pc-children-details-list">
          {children.map((child) => {
            const id = getChildId(child);
            const firstName = getValue(child, "firstName", "FirstName") || "";
            const lastName = getValue(child, "lastName", "LastName") || "";
            const name = getChildName(child);
            const dob = getDateOfBirth(child);
            const age = calculateAge(dob);
            const gender =
              getValue(child, "gender", "Gender") || "Not provided";
            const allergies = getValue(child, "allergies", "Allergies");
            const healthCondition = getValue(
              child,
              "healthCondition",
              "HealthCondition",
            );
            const createdDate = getValue(child, "createdDate", "CreatedDate");

            return (
              <article className="pc-child-detail-card" key={id}>
                <div className="pc-child-detail-header">
                  <div className="pc-child-avatar pc-child-avatar-large">
                    👧
                  </div>

                  <div className="pc-child-detail-heading">
                    <span className="pc-child-detail-label">CHILD PROFILE</span>
                    <h3>{name}</h3>
                    <p>
                      {age == null
                        ? "Age not available"
                        : `${age} ${age === 1 ? "year" : "years"} old`}
                    </p>
                  </div>

                  <div className="pc-child-id">
                    <span>Registration ID</span>
                    <strong>#{id}</strong>

                    <button
                      type="button"
                      className="pc-button pc-button-primary pc-edit-child-button"
                      onClick={() => openEditChild(child)}
                    >
                      ✎ Edit Details
                    </button>
                  </div>
                </div>

                <div className="pc-child-detail-section">
                  <h4>
                    <span aria-hidden="true">👤</span>
                    Personal Information
                  </h4>

                  <div className="pc-child-detail-grid">
                    <div className="pc-detail-field">
                      <span>First Name</span>
                      <strong>{firstName || "Not provided"}</strong>
                    </div>

                    <div className="pc-detail-field">
                      <span>Last Name</span>
                      <strong>{lastName || "Not provided"}</strong>
                    </div>

                    <div className="pc-detail-field">
                      <span>Date of Birth</span>
                      <strong>{dob ? formatDate(dob) : "Not provided"}</strong>
                    </div>

                    <div className="pc-detail-field">
                      <span>Age</span>
                      <strong>
                        {age == null
                          ? "Not available"
                          : `${age} ${age === 1 ? "year" : "years"} old`}
                      </strong>
                    </div>

                    <div className="pc-detail-field">
                      <span>Gender</span>
                      <strong>{String(gender)}</strong>
                    </div>

                    <div className="pc-detail-field">
                      <span>Registration Date</span>
                      <strong>
                        {createdDate
                          ? formatDate(createdDate)
                          : "Not available"}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="pc-child-detail-section">
                  <h4>
                    <span aria-hidden="true">🩺</span>
                    Health Information
                  </h4>

                  <div className="pc-health-detail-grid">
                    <div className="pc-health-detail pc-allergy-detail">
                      <span className="pc-health-icon" aria-hidden="true">
                        ⚠️
                      </span>
                      <div>
                        <span>Allergies</span>
                        <p>
                          {allergies && String(allergies).trim().length > 0
                            ? String(allergies)
                            : "No allergy information provided"}
                        </p>
                      </div>
                    </div>

                    <div className="pc-health-detail pc-condition-detail">
                      <span className="pc-health-icon" aria-hidden="true">
                        💚
                      </span>
                      <div>
                        <span>Health Conditions</span>
                        <p>
                          {healthCondition &&
                          String(healthCondition).trim().length > 0
                            ? String(healthCondition)
                            : "No health condition information provided"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );

  const renderMeals = () => (
    <section className={styles.card}>
      <div className="pc-card-heading pc-meal-page-heading">
        <div>
          <h2 className={styles.sectionTitle}>Meal Schedule</h2>
          <p className="pc-muted">View the meals scheduled by your daycare.</p>
        </div>

        <label className="pc-date-filter">
          <span>Filter by date</span>
          <select
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
            disabled={mealsLoading || mealDates.length === 0}
          >
            <option value="all">All scheduled dates</option>
            {mealDates.map((date) => (
              <option key={date} value={date}>
                {formatDate(date)}
              </option>
            ))}
          </select>
        </label>
      </div>

      {mealsLoading ? (
        renderLoading("Loading meal schedule...")
      ) : mealsError ? (
        renderError(mealsError, loadMeals)
      ) : filteredMeals.length === 0 ? (
        renderEmpty("No meals have been scheduled yet.")
      ) : (
        <div className="pc-meals-by-date">
          {Object.entries(
            filteredMeals.reduce((groups, meal) => {
              const date = String(
                getValue(meal, "date", "Date") || "unknown",
              ).slice(0, 10);

              if (!groups[date]) groups[date] = [];
              groups[date].push(meal);

              return groups;
            }, {}),
          ).map(([date, dateMeals]) => (
            <section className="pc-meal-date-group" key={date}>
              <h3>
                {date === "unknown" ? "Date not available" : formatDate(date)}
              </h3>
              {renderMealList(dateMeals)}
            </section>
          ))}
        </div>
      )}
    </section>
  );

  const renderAttendance = () => (
    <section className={styles.card}>
      <h2 className={styles.sectionTitle}>Attendance</h2>
      <p className="pc-muted pc-section-description">
        Check your children's arrival and departure information.
      </p>

      <div className="pc-feature-placeholder">
        <span aria-hidden="true">✓</span>
        <h3>Attendance is not connected yet</h3>
        <p>
          Your backend needs an attendance endpoint before this page can show
          real attendance dates, arrival times, departure times, or status.
        </p>
      </div>
    </section>
  );


const renderAnnouncements = () => (
  <section className={styles.card}>
    <h2 className={styles.sectionTitle}>Announcements</h2>
    <p className="pc-muted pc-section-description">
      Important updates and messages from your daycare.
    </p>

    {announcementsLoading ? (
      renderLoading("Loading announcements...")
    ) : announcementsError ? (
      renderError(announcementsError, loadAnnouncements)
    ) : announcements.length === 0 ? (
      renderEmpty("There are no announcements available right now.")
    ) : (
      <div className="pc-announcements-list">
        {announcements.map((announcement) => {
          const id = getValue(announcement, "id", "Id");
          const title =
            getValue(announcement, "title", "Title") ||
            "Untitled announcement";
          const message =
            getValue(announcement, "message", "Message") || "";
          const createdAt = getValue(
            announcement,
            "createdAt",
            "CreatedAt"
          );

          return (
            <article className="pc-announcement-card" key={id}>
              <div className="pc-announcement-icon" aria-hidden="true">
                📣
              </div>

              <div className="pc-announcement-content">
                <h3>{title}</h3>
                <p className="pc-announcement-date">
                  {formatDate(createdAt)}
                </p>
                <p className="pc-announcement-message">{message}</p>
              </div>
            </article>
          );
        })}
      </div>
    )}
  </section>
);

const loadComplaints = useCallback(async () => {
  setComplaintsLoading(true);
  setComplaintsError("");

  try {
    if (!token) {
      throw new Error("Please log in to view your complaints.");
    }

    const data = await fetchApi("/Complaints/mine", token);
    setComplaints(Array.isArray(data) ? data : []);
  } catch (error) {
    setComplaints([]);
    setComplaintsError(
      error.message || "Unable to load your complaints."
    );
  } finally {
    setComplaintsLoading(false);
  }
}, [token]);

useEffect(() => {
  loadComplaints();
}, [loadComplaints, refreshKey]);

const submitComplaint = async (event) => {
  event.preventDefault();

  if (!complaintSubject.trim() || !complaintDescription.trim()) {
    setComplaintsError("Please enter a subject and description.");
    return;
  }

  setComplaintSubmitting(true);
  setComplaintsError("");
  setComplaintSuccess("");

  try {
    await fetchApi("/Complaints", token, {
      method: "POST",
      body: JSON.stringify({
        subject: complaintSubject.trim(),
        description: complaintDescription.trim(),
      }),
    });

    setComplaintSubject("");
    setComplaintDescription("");
    setComplaintSuccess("Your complaint was submitted successfully.");

    await loadComplaints();
  } catch (error) {
    setComplaintsError(
      error.message || "Unable to submit your complaint."
    );
  } finally {
    setComplaintSubmitting(false);
  }
};

const renderComplaints = () => (
  <section className={styles.card}>
    <h2 className={styles.sectionTitle}>Complaints & Feedback</h2>
    <p className="pc-muted pc-section-description">
      Share a concern with the daycare administration and follow its progress.
    </p>

    <form className="pc-complaint-form" onSubmit={submitComplaint}>
      <label>
        Subject
        <input
          value={complaintSubject}
          onChange={(event) => setComplaintSubject(event.target.value)}
          placeholder="Briefly describe your concern"
          maxLength={200}
          required
        />
      </label>

      <label>
        Description
        <textarea
          value={complaintDescription}
          onChange={(event) =>
            setComplaintDescription(event.target.value)
          }
          placeholder="Explain your concern in detail..."
          rows={5}
          maxLength={5000}
          required
        />
      </label>

      {complaintsError && (
        <p className="pc-error" role="alert">{complaintsError}</p>
      )}

      {complaintSuccess && (
        <p className="pc-edit-success" role="status">
          {complaintSuccess}
        </p>
      )}

      <button
        type="submit"
        className="pc-button pc-button-primary"
        disabled={complaintSubmitting}
      >
        {complaintSubmitting ? "Submitting..." : "Submit Complaint"}
      </button>
    </form>

    <div className="pc-complaints-history">
      <h3 className={styles.sectionTitle}>My Submitted Complaints</h3>

      {complaintsLoading ? (
        renderLoading("Loading your complaints...")
      ) : complaintsError && complaints.length === 0 ? (
        renderError(complaintsError, loadComplaints)
      ) : complaints.length === 0 ? (
        renderEmpty("You have not submitted any complaints yet.")
      ) : (
        complaints.map((complaint) => {
          const id = getValue(complaint, "id", "Id");
          const subject = getValue(complaint, "subject", "Subject");
          const description = getValue(
            complaint, "description", "Description"
          );
          const status =
            getValue(complaint, "status", "Status") || "Pending";
          const response = getValue(
            complaint, "adminResponse", "AdminResponse"
          );
          const createdAt = getValue(
            complaint, "createdAt", "CreatedAt"
          );

          return (
            <article className="pc-complaint-card" key={id}>
              <div className="pc-complaint-heading">
                <h4>{subject}</h4>
                <span
                  className={`pc-complaint-status ${String(status)
                    .toLowerCase()
                    .replace(/\s+/g, "-")}`}
                >
                  {status}
                </span>
              </div>

              <p className="pc-complaint-date">
                Submitted: {formatDate(createdAt)}
              </p>
              <p>{description}</p>

              {response && (
                <div className="pc-complaint-response">
                  <strong>Daycare response</strong>
                  <p>{response}</p>
                </div>
              )}
            </article>
          );
        })
      )}
    </div>
  </section>
);


const handleProfileChange = (event) => {
  const { name, value } = event.target;

  setProfile((current) => ({
    ...current,
    [name]: value,
  }));
};

const handleProfileCancel = () => {
  const savedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("authUser") || "{}");
    } catch {
      return {};
    }
  })();

  setProfile({
    firstName: savedUser.firstName || savedUser.FirstName || "",
    lastName: savedUser.lastName || savedUser.LastName || "",
    email: savedUser.email || savedUser.Email || "",
    phoneNumber:
      savedUser.phoneNumber || savedUser.PhoneNumber || "",
  });

  setProfileMessage("");
  setIsEditingProfile(false);
};

const handleProfileSave = (event) => {
  event.preventDefault();

  const firstName = profile.firstName.trim();
  const lastName = profile.lastName.trim();
  const email = profile.email.trim();
  const phoneNumber = profile.phoneNumber.trim();

  if (!firstName || !lastName || !email) {
    setProfileMessage("First name, last name, and email are required.");
    return;
  }

  try {
    const savedUser = JSON.parse(
      localStorage.getItem("authUser") || "{}"
    );

    const updatedUser = {
      ...savedUser,
      firstName,
      lastName,
      email,
      phoneNumber,
    };

    localStorage.setItem("authUser", JSON.stringify(updatedUser));

    setProfile({
      firstName,
      lastName,
      email,
      phoneNumber,
    });

    setProfileMessage("Profile saved in this browser.");
    setIsEditingProfile(false);
    window.dispatchEvent(new Event("authChanged"));
  } catch {
    setProfileMessage("Unable to save your profile. Please try again.");
  }
};

const renderProfile = () => (
  <section className="pc-card pc-profile-page">
    <div className="pc-card-heading">
      <div>
        <h2 className={styles.sectionTitle}>My Profile</h2>
        <p className="pc-muted">
          View and manage your personal information.
        </p>
      </div>

      {!isEditingProfile && (
        <button
          type="button"
          className="pc-button pc-button-primary"
          onClick={() => {
            setProfileMessage("");
            setIsEditingProfile(true);
          }}
        >
          Edit Profile
        </button>
      )}
    </div>

    <div className="pc-parent-profile-banner">
      <div className="pc-parent-profile-avatar">
        {profile.firstName.charAt(0).toUpperCase() || "P"}
      </div>

      <div>
        <h2>
          {profile.firstName} {profile.lastName}
        </h2>
        <p>Parent Account</p>
      </div>
    </div>

    {profileMessage && (
      <p className="pc-edit-success" role="status">
        {profileMessage}
      </p>
    )}

    <form onSubmit={handleProfileSave}>
      <h3 className={styles.sectionTitle}>Personal Information</h3>

      <div className="pc-parent-profile-grid">
        <label>
          First Name *
          <input
            name="firstName"
            value={profile.firstName}
            onChange={handleProfileChange}
            disabled={!isEditingProfile}
            required
            maxLength={100}
          />
        </label>

        <label>
          Last Name *
          <input
            name="lastName"
            value={profile.lastName}
            onChange={handleProfileChange}
            disabled={!isEditingProfile}
            required
            maxLength={100}
          />
        </label>

        <label>
          Email Address *
          <input
            type="email"
            name="email"
            value={profile.email}
            onChange={handleProfileChange}
            disabled={!isEditingProfile}
            required
            maxLength={254}
          />
        </label>

        <label>
          Phone Number
          <input
            type="tel"
            name="phoneNumber"
            value={profile.phoneNumber}
            onChange={handleProfileChange}
            disabled={!isEditingProfile}
            maxLength={30}
            placeholder="Enter your phone number"
          />
        </label>
      </div>

      {isEditingProfile && (
        <div className="pc-edit-actions">
          <button
            type="button"
            className="pc-button pc-button-secondary"
            onClick={handleProfileCancel}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="pc-button pc-button-primary"
          >
            Save Changes
          </button>
        </div>
      )}
    </form>
  </section>
);

  const pageContent = {
    overview: renderOverview,
    children: renderChildren,
    meals: renderMeals,
    attendance: renderAttendance,
    announcements: renderAnnouncements,
  complaints: renderComplaints,
    profile: renderProfile,
    payments: renderPayments,
  };

  return (
    <div className="pc-app">
      <aside className="pc-sidebar">
        <div className="pc-brand">♡ Cuddle Care</div>
        <div className="pc-brand-subtitle">Parent Portal</div>

        <p className="pc-nav-label">MENU</p>


<nav className="pc-navigation" aria-label="Parent dashboard navigation">
  {navItems.map((item) => {
    const isActive = activePage === item.id;
    const Icon = item.icon;

    return (
      <button
        key={item.id}
        type="button"
        onClick={() => setActivePage(item.id)}
        aria-current={isActive ? "page" : undefined}
        className={`pc-nav-item ${isActive ? "active" : ""}`}
      >
        <span className="pc-nav-icon" aria-hidden="true">
          <Icon size={20} strokeWidth={1.8} />
        </span>

        <span>{item.label}</span>
      </button>
    );
  })}
</nav>


        <div className="pc-sidebar-spacer" />

        <div className="pc-help-card">
          <p className="pc-help-title">Need help?</p>
          <p>Contact your daycare administrator for assistance.</p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="pc-button pc-logout-button"
        >
          ↪ &nbsp; Logout
        </button>
      </aside>

      <main className="pc-main">
        <header className="pc-topbar">
          <div>
            <h1 className="pc-page-title">{pageTitle}</h1>
            <p className="pc-muted">
              Welcome to your Cuddle Care parent portal.
            </p>
          </div>

          <div className="pc-profile">
            <button
  type="button"
  className="pc-profile-avatar pc-profile-avatar-button"
  onClick={() => {
    setProfileMessage("");
    setActivePage("profile");
  }}
  aria-label="Open My Profile"
  title="My Profile"
>
  {parentName.charAt(0).toUpperCase()}
</button>
            <div>
              <p className="pc-profile-name">{parentName}</p>
              <p className="pc-profile-role">Parent account</p>
            </div>
          </div>
        </header>

        <div className="pc-page-content">
          {pageContent[activePage]()}

          {activePage === "children" && editSuccess && (
            <p className="pc-edit-success" role="status">
              ✓ {editSuccess}
            </p>
          )}

          {editingChild && (
            <div
              className="pc-edit-overlay"
              onMouseDown={(event) => {
                if (event.target === event.currentTarget && !savingChild) {
                  setEditingChild(null);
                  setEditError("");
                }
              }}
            >
              <section
                className="pc-edit-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="pc-edit-title"
              >
                <div className="pc-edit-modal-header">
                  <div>
                    <p className="pc-child-detail-label">CHILD PROFILE</p>
                    <h2 id="pc-edit-title">Edit Child Details</h2>
                    <p className="pc-muted">
                      Update your child's information below.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="pc-edit-close"
                    aria-label="Close edit form"
                    disabled={savingChild}
                    onClick={() => {
                      setEditingChild(null);
                      setEditError("");
                    }}
                  >
                    ×
                  </button>
                </div>

                <form onSubmit={saveChildChanges}>
                  <div className="pc-edit-form-grid">
                    <label className="pc-edit-field">
                      First Name
                      <input
                        name="firstName"
                        value={editingChild.firstName}
                        onChange={handleEditFieldChange}
                        required
                        maxLength={100}
                      />
                    </label>

                    <label className="pc-edit-field">
                      Last Name
                      <input
                        name="lastName"
                        value={editingChild.lastName}
                        onChange={handleEditFieldChange}
                        required
                        maxLength={100}
                      />
                    </label>

                    <label className="pc-edit-field">
                      Date of Birth
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={editingChild.dateOfBirth}
                        onChange={handleEditFieldChange}
                        required
                        max={getLocalDateString()}
                      />
                    </label>

                    <label className="pc-edit-field">
                      Gender
                      <input
                        name="gender"
                        value={editingChild.gender}
                        onChange={handleEditFieldChange}
                        maxLength={50}
                        placeholder="Enter gender"
                      />
                    </label>

                    <label className="pc-edit-field pc-edit-field-full">
                      Allergies
                      <textarea
                        name="allergies"
                        value={editingChild.allergies}
                        onChange={handleEditFieldChange}
                        rows={3}
                        maxLength={2000}
                        placeholder="Enter known allergies, or leave blank"
                      />
                    </label>

                    <label className="pc-edit-field pc-edit-field-full">
                      Health Conditions
                      <textarea
                        name="healthCondition"
                        value={editingChild.healthCondition}
                        onChange={handleEditFieldChange}
                        rows={3}
                        maxLength={2000}
                        placeholder="Enter relevant health conditions, or leave blank"
                      />
                    </label>
                  </div>

                  {editError && (
                    <div className="pc-error" role="alert">
                      {editError}
                    </div>
                  )}

                  <div className="pc-edit-actions">
                    <button
                      type="button"
                      className="pc-button pc-button-secondary"
                      disabled={savingChild}
                      onClick={() => {
                        setEditingChild(null);
                        setEditError("");
                      }}
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="pc-button pc-button-primary"
                      disabled={savingChild}
                    >
                      {savingChild ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              </section>
            </div>
          )}
        </div>

        <div className="pc-refresh-row">
          <button
            type="button"
            className="pc-button pc-button-secondary"
            onClick={retryLoading}
            disabled={childrenLoading || mealsLoading}
          >
            ↻ Refresh dashboard
          </button>
        </div>
      </main>
    </div>
  );
}

export default ParentDashboard;
