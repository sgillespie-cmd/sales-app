interface ContactItem {
  id: string;
  name: string;
  role: string | null;
  email: string | null;
  phone: string | null;
}

interface ContactsPanelProps {
  contacts: ContactItem[];
}

export function ContactsPanel({ contacts }: ContactsPanelProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <h2 className="text-lg font-semibold text-slate-900">Contacts</h2>
      {contacts.length === 0 ? (
        <p className="mt-2 text-sm text-slate-600">No contacts logged yet.</p>
      ) : (
        <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-slate-700">
          {contacts.map((contact) => (
            <li key={contact.id}>
              <strong>{contact.name}</strong>
              {contact.role ? ` — ${contact.role}` : ""}{" "}
              {contact.email ? `(${contact.email})` : ""}
              {contact.phone ? ` · ${contact.phone}` : ""}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
