import { API_BASE_URL } from "../services/api";

function ReportCard({ report }) {
  const photoUrl = (filename) => `${API_BASE_URL}/uploads/${encodeURIComponent(filename)}`;
  const created = report.createdAt ? new Date(report.createdAt).toLocaleDateString() : "";

  return (
    <article className="report-card">
      <div className="report-card-copy">
        <div className="report-card-heading">
          <h3>{report.title || "Waste issue reported"}</h3>
          <span className={`report-status ${report.status === "resolved" ? "resolved" : "pending"}`}>
            {report.status === "resolved" ? "Resolved" : "In progress"}
          </span>
        </div>
        <p>{report.description || "No additional details provided."}</p>
        {(report.area || report.location || created) && <small>{[report.area, report.location, created].filter(Boolean).join(" · ")}</small>}
      </div>
      <div className="report-card-images">
        {report.photo && <a href={photoUrl(report.photo)} target="_blank" rel="noreferrer"><img src={photoUrl(report.photo)} alt={`Reported waste: ${report.title || "issue"}`} loading="lazy" /></a>}
        {report.proof && <a href={photoUrl(report.proof)} target="_blank" rel="noreferrer"><img src={photoUrl(report.proof)} alt="Cleanup completion proof" loading="lazy" /></a>}
      </div>
    </article>
  );
}

export default ReportCard;
