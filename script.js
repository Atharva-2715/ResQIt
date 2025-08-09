// Emergency QR Code Generator
class EmergencyQRGenerator {
    constructor() {
        console.log('EmergencyQRGenerator constructor called');
        this.form = document.getElementById('emergencyForm');
        this.formSection = document.getElementById('formSection');
        this.qrSection = document.getElementById('qrSection');
        this.qrCanvas = document.getElementById('qrCodeCanvas');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.printBtn = document.getElementById('printBtn');
        this.editBtn = document.getElementById('editBtn');
        
        console.log('Elements found:', {
            form: !!this.form,
            formSection: !!this.formSection,
            qrSection: !!this.qrSection,
            qrCanvas: !!this.qrCanvas,
            downloadBtn: !!this.downloadBtn,
            printBtn: !!this.printBtn,
            editBtn: !!this.editBtn
        });
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        console.log('Setting up event listeners');
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleFormSubmit(e));
            console.log('Form submit listener added');
        } else {
            console.error('Form element not found!');
        }
        
        if (this.downloadBtn) {
            this.downloadBtn.addEventListener('click', () => this.downloadQRCode());
        }
        if (this.printBtn) {
            this.printBtn.addEventListener('click', () => this.printQRCode());
        }
        if (this.editBtn) {
            this.editBtn.addEventListener('click', () => this.editInformation());
        }
        
        // Auto-format phone number
        const phoneInput = document.getElementById('emergencyContactPhone');
        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => this.formatPhoneNumber(e));
            console.log('Phone input listener added');
        }
    }

    formatPhoneNumber(event) {
        let value = event.target.value.replace(/\D/g, '');
        if (value.length >= 10) {
            value = value.substring(0, 10);
            value = `(${value.substring(0, 3)}) ${value.substring(3, 6)}-${value.substring(6)}`;
        } else if (value.length >= 6) {
            value = `(${value.substring(0, 3)}) ${value.substring(3, 6)}-${value.substring(6)}`;
        } else if (value.length >= 3) {
            value = `(${value.substring(0, 3)}) ${value.substring(3)}`;
        }
        event.target.value = value;
    }

    handleFormSubmit(event) {
        console.log('Form submit handler called');
        event.preventDefault();
        
        const formData = new FormData(this.form);
        const emergencyData = {
            fullName: formData.get('fullName'),
            emergencyContactName: formData.get('emergencyContactName'),
            emergencyContactPhone: formData.get('emergencyContactPhone'),
            bloodType: formData.get('bloodType'),
            allergies: formData.get('Allergies') || 'None specified'
        };

        console.log('Form data collected:', emergencyData);

        // Validate required fields
        if (!emergencyData.fullName || !emergencyData.emergencyContactName || 
            !emergencyData.emergencyContactPhone || !emergencyData.bloodType) {
            console.log('Validation failed - missing required fields');
            this.showError('Please fill in all required fields.');
            return;
        }

        console.log('Validation passed, calling generateQRCode');
        this.generateQRCode(emergencyData);
    }

    generateQRCode(data) {
        console.log('generateQRCode called with data:', data);
        
        // Check if qrcode library is available
        if (typeof qrcode === 'undefined') {
            console.error('QRCode library is not loaded');
            this.showError('QR Code library failed to load. Please refresh the page and try again.');
            return;
        }
        
        try {
            // Create formatted emergency information string
            const emergencyInfo = this.formatEmergencyData(data);
            console.log('Emergency info formatted:', emergencyInfo);
            
            // Create QR code instance
            const qr = qrcode(0, 'H'); // Type 0 (auto), High error correction
            qr.addData(emergencyInfo);
            qr.make();
            
            // Get the module count (size of the QR code)
            const moduleCount = qr.getModuleCount();
            const cellSize = 300 / moduleCount; // Scale to fit 300px canvas
            
            // Set canvas size
            this.qrCanvas.width = 300;
            this.qrCanvas.height = 300;
            
            // Get canvas context
            const ctx = this.qrCanvas.getContext('2d');
            
            // Clear canvas
            ctx.clearRect(0, 0, 300, 300);
            
            // Draw white background
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, 300, 300);
            
            // Draw QR code modules
            ctx.fillStyle = '#000000';
            for (let row = 0; row < moduleCount; row++) {
                for (let col = 0; col < moduleCount; col++) {
                    if (qr.isDark(row, col)) {
                        ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
                    }
                }
            }
            
            console.log('QR Code generated successfully');
            // Show QR code section and hide form
            this.showQRSection();
            
        } catch (error) {
            console.error('QR Code generation failed:', error);
            this.showError('Failed to generate QR code. Please try again.');
        }
    }

    formatEmergencyData(data) {
        // Create a vCard format for emergency contact
        const vCard = [
            'BEGIN:VCARD',
            'VERSION:3.0',
            `FN:${data.fullName}`,
            `NOTE:EMERGENCY CONTACT INFO`,
            `NOTE:Blood Type: ${data.bloodType}`,
            `NOTE:Emergency Contact: ${data.emergencyContactName}`,
            `NOTE:Emergency Phone: ${data.emergencyContactPhone}`,
            `NOTE:Medical Info: ${data.allergies || 'None specified'}`,
            'END:VCARD'
        ].join('\n');
        
        // But for better readability in most QR scanners, use readable format
        const readable = [
            ' EMERGENCY CONTACT ',
            '',
            `PATIENT: ${data.fullName}`,
            `BLOOD TYPE: ${data.bloodType}`,
            '',
            `IN CASE OF EMERGENCY, CONTACT:`,
            `Name: ${data.emergencyContactName}`,
            `Phone: ${data.emergencyContactPhone}`,
            '',
            `MEDICAL CONDITIONS:`,
            `${data.allergies || 'None reported'}`,
            '',
            'Generated by ResQIt'
        ].join('\n');
        
        return vCard && readable;
    }

    showQRSection() {
        this.formSection.style.display = 'none';
        document.querySelector('.qr-preview-section').style.display = 'none';
        this.qrSection.style.display = 'block';
        
        // Smooth scroll to QR section
        this.qrSection.scrollIntoView({ behavior: 'smooth' });
    }

    showFormSection() {
        this.qrSection.style.display = 'none';
        this.formSection.style.display = 'block';
        document.querySelector('.qr-preview-section').style.display = 'block';
        
        // Smooth scroll to form section
        this.formSection.scrollIntoView({ behavior: 'smooth' });
    }

    downloadQRCode() {
        // Create download link
        const link = document.createElement('a');
        link.download = 'emergency-qr-code.png';
        link.href = this.qrCanvas.toDataURL('image/png');
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showSuccess('QR code downloaded successfully!');
    }

    printQRCode() {
        // Create a new window for printing
        const printWindow = window.open('', '_blank');
        const qrDataURL = this.qrCanvas.toDataURL('image/png');
        
        // Get form data for print layout
        const formData = new FormData(this.form);
        const name = formData.get('fullName');
        const bloodType = formData.get('bloodType');
        
        printWindow.document.write(// Replace the content inside printWindow.document.write() with this:

            `<!DOCTYPE html>
            <html>
            <head>
                <title>Emergency QR Code - ${name}</title>
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        margin: 0;
                        padding: 20px;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        min-height: 100vh;
                        background: #f5f5f5;
                    }
                    
                    .card {
                        width: 3.5in;
                        height: 2.3in;
                        background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
                        border: 3px solid #e74c3c;
                        border-radius: 12px;
                        padding: 15px;
                        display: flex;
                        align-items: center;
                        gap: 15px;
                        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                        position: relative;
                        overflow: hidden;
                    }
                    
                    .card::before {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        height: 4px;
                        background: linear-gradient(90deg, #e74c3c, #c0392b, #e74c3c);
                    }
                    
                    .qr-section {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        flex-shrink: 0;
                    }
                    
                    .qr-code {
                        width: 1.4in;
                        height: 1.4in;
                        border: 2px solid #ecf0f1;
                        border-radius: 8px;
                        padding: 3px;
                        background: white;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    }
                    
                    .scan-text {
                        font-size: 8px;
                        color: #7f8c8d;
                        margin-top: 4px;
                        text-align: center;
                        font-weight: 500;
                    }
                    
                    .info {
                        flex: 1;
                        display: flex;
                        flex-direction: column;
                        justify-content: space-between;
                        height: 100%;
                        padding: 5px 0;
                    }
                    
                    .header {
                        border-bottom: 2px solid #e74c3c;
                        padding-bottom: 6px;
                        margin-bottom: 8px;
                    }
                    
                    .title {
                        font-weight: 800;
                        font-size: 14px;
                        color: #e74c3c;
                        letter-spacing: 0.5px;
                        text-transform: uppercase;
                    }
                    
                    .subtitle {
                        font-size: 9px;
                        color: #7f8c8d;
                        margin-top: 2px;
                        font-weight: 500;
                    }
                    
                    .patient-info {
                        flex: 1;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                    }
                    
                    .name {
                        font-weight: 700;
                        font-size: 13px;
                        color: #2c3e50;
                        margin-bottom: 4px;
                    }
                    
                    .blood-type {
                        background: #e74c3c;
                        color: white;
                        padding: 2px 8px;
                        border-radius: 12px;
                        font-size: 10px;
                        font-weight: 600;
                        display: inline-block;
                        width: fit-content;
                        margin-bottom: 6px;
                    }
                    
                    .instructions {
                        font-size: 9px;
                        color: #7f8c8d;
                        line-height: 1.3;
                        font-style: italic;
                    }
                    
                    .footer {
                        border-top: 1px solid #ecf0f1;
            padding-top: 6px;
            margin-top: 8px;
            padding-bottom: 8px;
                    }
                    
                    .emergency-badge {
                        background: #27ae60;
                        color: white;
                        padding: 1px 6px;
                        border-radius: 8px;
                        font-size: 8px;
                        font-weight: 600;
                        display: inline-block;
                        margin-bottom: 2px;
                    }
                    
                    .features {
                        font-size: 8px;
                        color: #95a5a6;
                        line-height: 1.2;
                        margin-bottom: 10px;
                    }
                    
                    @media print {
                        body { 
                            margin: 0; 
                            padding: 10px; 
                            background: white !important;
                        }
                        .card { 
                            box-shadow: none; 
                            border-color: #333;
                        }
                        .card::before {
                            background: #333;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="card">
                    <div class="qr-section">
                        <img src="${qrDataURL}" alt="Emergency QR Code" class="qr-code">
                        <div class="scan-text">SCAN ME</div>
                    </div>
                    
                    <div class="info">
                        <div class="header">
                            <div class="title">🚨 Emergency QR</div>
                            <div class="subtitle">Medical Information Card</div>
                        </div>
                        
                        <div class="patient-info">
                            <div class="name">${name}</div>
                            <div class="blood-type">${bloodType}</div>
                            <div class="instructions">
                                Scan QR code for complete emergency contact information and medical details
                            </div>
                        </div>
                        
                        <div class="footer">
                            <div class="emergency-badge">✓ VERIFIED</div>
                            <div class="features">
                                Contains: Emergency contacts • Medical conditions • Blood type information
                            </div>
                        </div>
                    </div>
                </div>
            </body>
            </html>`);
        
        printWindow.document.close();
        
        // Wait for image to load then print
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
        
        this.showSuccess('Print dialog opened!');
    }

    editInformation() {
        this.showFormSection();
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showNotification(message, type) {
        // Remove any existing notifications
        const existing = document.querySelector('.notification');
        if (existing) {
            existing.remove();
        }

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
            word-wrap: break-word;
            ${type === 'error' ? 'background: #f44336;' : 'background: #4caf50;'}
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);

        // Auto remove after 4 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new EmergencyQRGenerator();
});

// Add some helpful utilities
window.testQRCode = function() {
    // Developer utility to test QR code with sample data
    const sampleData = {
        fullName: 'John Doe',
        emergencyContactName: 'Jane Doe',
        emergencyContactPhone: '(555) 123-4567',
        bloodType: 'O+',
        allergies: 'Penicillin allergy, Type 2 diabetes'
    };
    
    const generator = new EmergencyQRGenerator();
    generator.generateQRCode(sampleData);
}; 