"use client";

interface DocumentsPanelProps {
  venueId: string;
  documents: Array<{
    id: string;
    fileName: string;
    docKind: string;
    uploadedAt: string;
  }>;
}

export function DocumentsPanel({ venueId, documents }: DocumentsPanelProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold">Documents</h2>
      <p className="mt-2 text-sm text-slate-600">
        Upload brochures, menus, and pricing sheets for venue {venueId}.
      </p>
      <p className="mt-1 text-sm text-slate-500">
        The signed upload URL route is wired at{" "}
        <code>/api/venues/{venueId}/documents/upload-url</code>.
      </p>
      {documents.length === 0 ? (
        <p className="mt-3 text-sm text-slate-600">No documents uploaded yet.</p>
      ) : (
        <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-slate-700">
          {documents.map((document) => (
            <li key={document.id}>
              {document.fileName} ({document.docKind}) ·{" "}
              {new Date(document.uploadedAt).toLocaleDateString()}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
