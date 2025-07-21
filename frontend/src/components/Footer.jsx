import React from "react";

export default function Footer() {
  return (
    <footer className="bg-gray-200 text-center py-4 mt-8">
      <p>Made with ❤️ by <strong>Arpit Dhumane</strong></p>
      <p>
        <a href="https://www.linkedin.com/in/arpit-dhumane-7a235a278/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
          LinkedIn
        </a> |{" "}
        <a href="https://github.com/arpitbytes507" target="_blank" rel="noopener noreferrer" className="text-gray-800 underline">
          GitHub
        </a> |{" "}
        <a href="mailto:arpit.dhumane@gmail.com" className="text-red-600 underline">
          Email
        </a>
      </p>
    </footer>
  );
}
