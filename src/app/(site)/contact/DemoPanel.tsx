"use client";

import { useState } from "react";
import { BookingPanel } from "./BookingPanel";
import { ContactForm, type ContactDetails } from "./ContactForm";

/**
 * Holds the form and the calendar side by side and keeps one piece of state
 * between them: whoever is typing their details on the left should not have to
 * type them again to hold a slot on the right.
 */
export function DemoPanel() {
  const [contact, setContact] = useState<ContactDetails>({
    name: "",
    email: "",
    company: "",
    subject: "",
  });

  return (
    <div className="grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
      <div className="p-6 md:p-8">
        <ContactForm onDetailsChange={setContact} />
      </div>

      <div className="border-t border-[var(--ax-line)] p-6 md:p-8 lg:border-l lg:border-t-0">
        <BookingPanel contact={contact} />
      </div>
    </div>
  );
}
