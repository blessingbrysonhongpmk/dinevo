import React from 'react';

export default function PhoneFrame({ children, title = 'DINEVO' }) {
  return (
    <div className="dv-phone-frame">
      {/* Phone bezel top */}
      <div className="dv-phone-notch">
        <div className="dv-phone-notch-cam" />
        <div className="dv-phone-notch-speaker" />
      </div>

      {/* Phone status bar */}
      <div className="dv-phone-statusbar">
        <span>9:41</span>
        <span className="dv-phone-statusbar-icons">
          <span>📶</span>
          <span>🔋</span>
        </span>
      </div>

      {/* Phone screen content */}
      <div className="dv-phone-screen">
        {children}
      </div>

      {/* Phone home bar */}
      <div className="dv-phone-homebar">
        <div className="dv-phone-homebar-line" />
      </div>
    </div>
  );
}
