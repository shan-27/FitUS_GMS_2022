import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import QRCode from 'qrcode.react';
import './QR.css';

function QR(props) {
  const idNumber = useSelector((state) => state.auth.user._id);

  const downloadQR = () => {
    const canvas = document.getElementById('qr-canvas');
    const pngUrl = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
    let downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = 'qr-code.png';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div className="content-wrapper">
    <div className="page-header">
      <h3 className="page-title">
        <span className="page-title-icon bg-gradient-primary text-white me-2">
          <i className="mdi mdi-account-multiple"></i>
        </span>
        QR Code
      </h3>
    </div>
    <div className="card">
        <div className="card-body">
            <strong>Here is your QR code to use to attend to the gym</strong>
            <div className="qr-code-generator">
            <div className="qr-code">
                <QRCode id="qr-canvas" value={idNumber } />
            </div>
            <button className="download-button" onClick={downloadQR}>Download QR Code</button>
            </div>
        </div>
    </div>

    
  </div>
    
  );
}

export default QR;