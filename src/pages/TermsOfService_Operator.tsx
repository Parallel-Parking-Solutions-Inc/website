import React from 'react';
import './Legal.css';

const TermsOfService_Operator: React.FC = () => {
    const isOperatorRedirect = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('redirect-from-operator');

    const handleReturnToOperator = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        window.close();
    };

    return (
        <div className="legal-page-container">
            <div className="legal-header">
                <h1 className="legal-title">Terms of Service: Operator</h1>
                <div className="legal-meta">
                    <div className="legal-meta-item">
                        <span className="legal-meta-label">Effective Date:</span>
                        <span className="legal-meta-value">February 1, 2026</span>
                    </div>
                    <div className="legal-meta-item">
                        <span className="legal-meta-label">Last Updated:</span>
                        <span className="legal-meta-value">January 30, 2026</span>
                    </div>
                </div>

                <div className="legal-navigation">
                    {isOperatorRedirect && (
                        <button type="button" className="legal-nav-link" onClick={handleReturnToOperator}>
                            Return to Operator
                            <span className="legal-nav-arrow">×</span>
                        </button>
                    )}
                    <a href="/legal/operator/privacy-policy" className="legal-nav-link">
                        Operator Privacy Policy
                        <span className="legal-nav-arrow">→</span>
                    </a>
                    {!isOperatorRedirect && <div></div>}
                </div>
            </div>

            <div className="legal-content">
                <section className="legal-section" id="acceptance">
                    <h2 className="legal-section-title">1. Acceptance of Terms</h2>
                    <div className="legal-section-content">
                        <p>
                            Welcome to Parallel, a comprehensive parking management and analytics platform provided by Parallel Parking Solutions Inc.
                        </p>
                        <div className="legal-highlight">
                            <p>
                                <strong>
                                    By accessing or using any part of the Parallel platform or its related services ("Services"), you agree to be
                                    bound by these Terms of Service ("Terms") and our Privacy Policy.
                                </strong>
                            </p>
                        </div>
                        <p>
                            Please read them carefully. We offer a range of services, and in some cases, additional terms may apply. When
                            applicable, such additional terms will be presented alongside the relevant service, and by using those specific
                            services, you agree to be bound by the additional terms as well. If you do not agree to these Terms in their
                            entirety, you may not access or use our Services.
                        </p>
                    </div>
                </section>

                <section className="legal-section" id="description">
                    <h2 className="legal-section-title">2. Description of Service</h2>
                    <div className="legal-section-content">
                        <p>
                            The Parallel Operator Portal is a cloud-based parking management system provided by Parallel Parking Solutions Inc. ("Company", "Parallel", "we", "us", or "our").
                        </p>
                        <p>
                            These Terms of Service ("Terms") govern your access to and use of our website, mobile applications, APIs, dashboards, and any other services we provide (collectively, the "Services").
                        </p>
                        <p>
                            The Services are designed to enable parking lot operators to efficiently manage their facilities, including monitoring real-time occupancy, processing transactions, configuring rate structures, managing vehicle registries, and accessing operational analytics. The Operator Portal works in conjunction with our mobile application, which is governed by separate <a href="/legal/app/terms-of-service" className="legal-link" target="_blank" rel="noopener noreferrer">Terms of Service</a> and <a href="/legal/app/privacy-policy" className="legal-link" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.
                        </p>
                        <p>
                            These Terms apply to all individuals and organizations that use the Operator Portal or any part of the Services to manage parking infrastructure and related data.
                        </p>
                    </div>
                </section>

                <section className="legal-section" id="user-accounts">
                    <h2 className="legal-section-title">3. User Accounts and Access</h2>
                    <div className="legal-section-content">
                        <p>
                            To access and use the Services, you must register for an account with accurate and complete information. You are solely responsible for maintaining the confidentiality of your account credentials and for all activities conducted under your account.
                        </p>
                        <p>You agree to:</p>
                        <ul className="legal-list">
                            <li className="legal-list-item">Keep your login credentials secure.</li>
                            <li className="legal-list-item">Notify us immediately at <a href="mailto:info@parkwithparallel.com" className="legal-email">info@parkwithparallel.com</a> of any unauthorized access or use of your account.</li>
                            <li className="legal-list-item">Ensure that all use of the Services under your account complies with these Terms and all applicable laws.</li>
                        </ul>
                        <p>
                            We are not liable for any loss or damage arising from unauthorized use of your account due to your failure to safeguard your credentials.
                        </p>
                    </div>
                </section>

                <section className="legal-section" id="data-collection">
                    <h2 className="legal-section-title">4. Data Collection and Use</h2>
                    <div className="legal-section-content">
                        <p>
                            The Service collects and processes various types of data including but not limited to:
                        </p>
                        <ul className="legal-list">
                            <li className="legal-list-item">Vehicle entry and exit data from parking lots</li>
                            <li className="legal-list-item">License plate information and registry data</li>
                            <li className="legal-list-item">User account information and contact details</li>
                            <li className="legal-list-item">Parking session data and occupancy metrics</li>
                            <li className="legal-list-item">Payment and billing information</li>
                            <li className="legal-list-item">System usage and analytics data</li>
                        </ul>
                        <p>This data is used to:</p>
                        <ul className="legal-list">
                            <li className="legal-list-item">Deliver and operate the core functionality of the Services;</li>
                            <li className="legal-list-item">Monitor and enhance performance and reliability;</li>
                            <li className="legal-list-item">Prevent fraud and ensure security;</li>
                            <li className="legal-list-item">Generate insights for operators;</li>
                            <li className="legal-list-item">Comply with legal and regulatory obligations.</li>
                        </ul>
                        <p>
                            All data collection, processing, and storage practices are governed by our <a href="/legal/operator/privacy-policy" className="legal-link" target="_blank" rel="noopener noreferrer">Privacy Policy</a>, which forms an integral part of these Terms.
                        </p>
                    </div>
                </section>

                <section className="legal-section" id="acceptable-use">
                    <h2 className="legal-section-title">5. Acceptable Use</h2>
                    <div className="legal-section-content">
                        <p>
                            You agree to use the Services only for lawful purposes and in full compliance with these Terms, applicable laws, and all relevant regulations.
                            You shall not, and shall not permit others to:
                        </p>
                        <ul className="legal-list">
                            <li className="legal-list-item">Use the Services in any way that violates any applicable law, regulation, or third-party right</li>
                            <li className="legal-list-item">Access, tamper with, or use non-public areas of the Services, our systems, or the technical delivery systems of our providers</li>
                            <li className="legal-list-item">Attempt to probe, scan, or test the vulnerability of any system or network related to the Services, or breach any security or authentication measures</li>
                            <li className="legal-list-item">Interfere with, disrupt, or negatively affect the integrity or performance of the Services or any third-party data or network</li>
                            <li className="legal-list-item">Share, sell, lease, or otherwise transfer your account credentials to unauthorized parties</li>
                            <li className="legal-list-item">Use the Services to unlawfully collect, store, or disclose personal or sensitive information of other users or third parties</li>
                            <li className="legal-list-item">
                                Use any automated systems (e.g., bots, scrapers) to access the Services in a manner that sends more request messages than a human could reasonably produce in the same period using a conventional browser
                            </li>
                        </ul>
                        <p>
                            We reserve the right to suspend or terminate your access to the Services if we believe you have violated this section.
                        </p>
                    </div>
                </section>

                <section className="legal-section" id="intellectual-property">
                    <h2 className="legal-section-title">6. Intellectual Property</h2>
                    <div className="legal-section-content">
                        <p>
                            The Services, including all software, technology, content, designs, trademarks, and other materials provided by Parallel Parking Solutions Inc., are and will remain the sole and exclusive property of the Company and its licensors. This includes but is not limited to:
                        </p>
                        <ul className="legal-list">
                            <li className="legal-list-item">The underlying source code and algorithms</li>
                            <li className="legal-list-item">Visual interfaces, dashboard layouts, and design elements</li>
                            <li className="legal-list-item">Logos, brand names, and trademarks</li>
                            <li className="legal-list-item">Data structures, compiled datasets, and analytics models</li>
                            <li className="legal-list-item">Any company product or physical hardware</li>
                        </ul>
                        <p>
                            The Services are protected by applicable intellectual property laws, including copyright, trademark, and trade secret laws. No right, title, or interest is granted to you except for the limited, revocable license to use the Services as expressly permitted under these Terms. Any unauthorized use of our intellectual property is strictly prohibited.
                        </p>
                    </div>
                </section>

                <section className="legal-section" id="privacy-data-protection">
                    <h2 className="legal-section-title">7. Privacy and Data Protection</h2>
                    <div className="legal-section-content">
                        <p>
                            Your privacy is important to us. Our <a href="/legal/operator/privacy-policy" className="legal-link" target="_blank" rel="noopener noreferrer">Privacy Policy</a> explains in detail how we collect, use, process, and protect your personal and operational information when you use the Services. By accessing or using the Services, you consent to the collection and use of your information as outlined in the Privacy Policy.
                        </p>
                        <p>
                            At present, data export functionality is not available directly within the application. However, operators may request access to, or deletion of, their data by contacting us at <a href="mailto:info@parkwithparallel.com" className="legal-email">info@parkwithparallel.com</a>. All such requests are subject to identity verification and applicable legal limitations.
                        </p>
                    </div>
                </section>

                <section className="legal-section" id="limitation-liability">
                    <h2 className="legal-section-title">8. Limitation of Liability</h2>
                    <div className="legal-section-content">
                        <p>
                            To the fullest extent permitted by law, Parallel Parking Solutions Inc., including its officers, directors, employees, agents, affiliates, and licensors, shall not be liable for any indirect, incidental, special, consequential, exemplary, or punitive damages. This includes, without limitation, damages for loss of profits, data, use, goodwill, or other intangible losses, resulting from:
                        </p>
                        <ul className="legal-list">
                            <li className="legal-list-item">Your use of or inability to use the Services</li>
                            <li className="legal-list-item">Any conduct or content of any third party on the Services</li>
                            <li className="legal-list-item">Any unauthorized access to or use of our servers and/or any personal or other data stored therein</li>
                            <li className="legal-list-item">Any interruption or cessation of the Services</li>
                        </ul>
                        <p>
                            In jurisdictions where limitation of liability is restricted, our liability shall be limited to the maximum extent permitted by law.
                        </p>
                    </div>
                </section>

                <section className="legal-section" id="indemnification">
                    <h2 className="legal-section-title">9. Indemnification</h2>
                    <div className="legal-section-content">
                        <p>
                            You agree to defend, indemnify, and hold harmless Parallel Parking Solutions Inc., its affiliates, and their respective officers, directors, employees, contractors, and agents from and against any and all third-party claims, damages, obligations, losses, liabilities, costs, or expenses (including reasonable attorney's fees) arising from:
                        </p>
                        <ul className="legal-list">
                            <li className="legal-list-item">Your use of and access to the Services</li>
                            <li className="legal-list-item">Your violation of these Terms</li>
                            <li className="legal-list-item">Your violation of any third-party rights, including intellectual property, data protection, or privacy rights</li>
                            <li className="legal-list-item">Any content or data submitted through your account</li>
                        </ul>
                        <p>
                            This indemnification obligation will survive termination or expiration of these Terms and your use of the Services.
                        </p>
                    </div>
                </section>

                <section className="legal-section" id="data-ownership">
                    <h2 className="legal-section-title">10. Data Ownership</h2>
                    <div className="legal-section-content">
                        <p>
                            You retain all rights, title, and interest in and to the data you upload or submit through the Services, including session data, vehicle information, and registry records ("User Data"). By using the Services, you grant Parallel Parking Solutions Inc. a limited, non-exclusive, royalty-free, and revocable license to store, process, analyze, and display User Data solely for the purposes of operating, maintaining, improving, and providing the Services.
                        </p>
                        <p>
                            We do not claim ownership over your data, and we do not sell or share it with third parties except as described in our <a href="/legal/operator/privacy-policy" className="legal-link" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.
                        </p>
                    </div>
                </section>

                <section className="legal-section" id="third-party-technologies">
                    <h2 className="legal-section-title">11. Use of Third-Party Technologies</h2>
                    <div className="legal-section-content">
                        <p>
                            The Services may include the use of third-party technologies, including automatic license plate recognition (ALPR) systems powered by <a href="https://www.vaxtor.com/" className="legal-link" target="_blank" rel="noopener noreferrer">Vaxtor Technologies</a> for software and <a href="https://i-pro.com/" className="legal-link" target="_blank" rel="noopener noreferrer">i-PRO</a> for camera hardware. By using the platform, you consent to the collection and processing of vehicle registration data through such third-party imaging systems, subject to applicable data protection regulations.
                        </p>
                        <p>
                            We also integrate with various third-party services to deliver core functionality, including:
                        </p>
                        <ul className="legal-list">
                            <li className="legal-list-item"><strong>Stripe:</strong> For payment processing and billing management</li>
                            <li className="legal-list-item"><strong>Firebase:</strong> For push notifications and real-time data synchronization</li>
                            <li className="legal-list-item"><strong>Amazon Web Services (AWS):</strong> For secure cloud infrastructure and data storage</li>
                            <li className="legal-list-item"><strong>AWS Simple Notification Service (SNS):</strong> For SMS notifications and communications</li>
                        </ul>
                        <p>
                            We do not control the functionality of such systems and disclaim any liability for the performance, accuracy, or legality of third-party technologies used within the Service. For information about how we handle data collected through these systems, please refer to our <a href="/legal/operator/privacy-policy" className="legal-link">Privacy Policy</a>.
                        </p>
                    </div>
                </section>

                <section className="legal-section" id="ai-services">
                    <h2 className="legal-section-title">12. AI-Powered Services and Human Oversight</h2>
                    <div className="legal-section-content">
                        <p>
                            Portions of the Operator Portal now include AI-driven assistants (“Parallel AI Agents”) that can propose task summaries,
                            draft responses, or prepare operational changes such as rate adjustments or registry updates. These automations rely on the
                            operational data you provide and the prompts you configure. AI output is generated on a best-effort basis and may include
                            errors or omissions. You remain responsible for reviewing every AI recommendation, confirming any suggested action, and
                            ensuring that downstream updates are accurate and lawful.
                        </p>
                        <p>
                            By enabling an AI Agent you (a) authorize Parallel to process the relevant lot data in order to craft prompts and payload
                            templates, (b) acknowledge that all confirmations are logged for auditing and abuse prevention, and (c) agree not to use
                            AI tools to circumvent applicable law, parking rules, or these Terms. We may temporarily disable AI access for accounts
                            that misuse the feature or when additional safeguards are required. AI tools are optional; if you do not engage with an
                            agent, no lot data is routed to model providers for that feature.
                        </p>
                    </div>
                </section>

                <section className="legal-section" id="communications">
                    <h2 className="legal-section-title">13. Communications and Notifications</h2>
                    <div className="legal-section-content">
                        <p>
                            We send only transactional and operational communications related to the Services, such as account verification, security
                            alerts, billing updates, user activity notices, policy changes, and lot notifications you have enabled. These messages may
                            be delivered via email or SMS and are necessary to operate the Service; there is no marketing email program. You can manage
                            lot-level notification preferences in the Operator Portal and update your contact email at any time. Certain security,
                            billing, and legal notices may be required and cannot be fully opted out of while you maintain an active account.
                        </p>
                    </div>
                </section>

                <section className="legal-section" id="service-availability">
                    <h2 className="legal-section-title">14. Service Availability</h2>
                    <div className="legal-section-content">
                        <p>
                            We strive to maintain the availability, reliability, and performance of the Services. However, Parallel Parking Solutions Inc. does not guarantee uninterrupted or error-free access. The Services may be temporarily suspended or limited due to scheduled maintenance, updates, infrastructure issues, or events beyond our control (such as outages or force majeure events).
                        </p>
                        <p>
                            We will make reasonable efforts to provide advance notice for planned downtime whenever feasible.
                        </p>
                    </div>
                </section>

                <section className="legal-section" id="modifications">
                    <h2 className="legal-section-title">15. Modifications to Terms</h2>
                    <div className="legal-section-content">
                        <p>
                            We reserve the right to update or modify these Terms at any time, at our sole discretion. If we make material changes, we will notify users by posting the updated Terms on this page and updating the "Effective Date" at the top. We may also notify you via email or in-app messages, where appropriate.
                        </p>
                        <p>
                            Your continued use of the Services after any such modification constitutes your acceptance of the revised Terms. If you do not agree to the updated Terms, you must stop using the Services.
                        </p>
                    </div>
                </section>

                <section className="legal-section" id="termination">
                    <h2 className="legal-section-title">16. Termination</h2>
                    <div className="legal-section-content">
                        <p>
                            We may suspend or terminate your access to the Services, including your account, at any time and without prior notice or liability, for any reason, including but not limited to:
                        </p>
                        <ul className="legal-list">
                            <li className="legal-list-item">Breach of these Terms</li>
                            <li className="legal-list-item">Violation of applicable laws</li>
                            <li className="legal-list-item">Extended periods of inactivity</li>
                            <li className="legal-list-item">Security or legal concerns</li>
                        </ul>
                        <p>
                            Upon termination, your right to use the Services will immediately cease. You may also terminate your account at any time by contacting <a href="mailto:info@parkwithparallel.com" className="legal-email">info@parkwithparallel.com</a>.
                        </p>
                        <p>
                            Certain provisions of these Terms, including those related to intellectual property, limitation of liability, indemnification, and governing law, shall survive termination.
                        </p>
                    </div>
                </section>

                <section className="legal-section" id="governing-law">
                    <h2 className="legal-section-title">17. Governing Law</h2>
                    <div className="legal-section-content">
                        <p>
                            These Terms shall be governed by and construed in accordance with the laws of the Province of Ontario, Canada, and the applicable federal laws of Canada. Where required by applicable jurisdiction, U.S. laws may also apply.
                        </p>
                        <p>
                            Any legal proceedings arising from these Terms or your use of the Services shall be subject to the exclusive jurisdiction of the courts located in Ontario, Canada, unless otherwise required by applicable law.
                        </p>
                    </div>
                </section>

                <section className="legal-section" id="purchases-payments">
                    <h2 className="legal-section-title">18. Purchases and Payments</h2>
                    <div className="legal-section-content">
                        <p>
                            Certain Services may require payment. By submitting payment information, you authorize us to charge applicable fees to your provided payment method. All payments are final and non-refundable unless otherwise required by law.
                        </p>
                        <p>
                            Pricing and billing terms may be updated from time to time, and we will make reasonable efforts to notify you of any changes.
                        </p>
                        <p>
                            You are responsible for any applicable taxes or charges imposed by your jurisdiction.
                        </p>
                    </div>
                </section>

                <section className="legal-section" id="disclaimer">
                    <h2 className="legal-section-title">19. Disclaimer</h2>
                    <div className="legal-section-content">
                        <p>
                            The Services are provided on an "as is" and "as available" basis. We disclaim all warranties, express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, and non-infringement.
                            We make no representation or warranty that the Services will be uninterrupted, error-free, or secure. Use of the Services is at your own risk.
                        </p>
                    </div>
                </section>

                <section className="legal-section" id="contact">
                    <h2 className="legal-section-title">20. Contact Information</h2>
                    <div className="legal-section-content">
                        <p>
                            We provide technical support on a best-effort basis during standard business hours. You may reach our support team at <a href="mailto:info@parkwithparallel.com" className="legal-email">info@parkwithparallel.com</a>.
                            We do not guarantee response times but strive to address inquiries within 48 hours. For urgent issues or downtime, we may provide priority escalation paths for verified Operator accounts.
                        </p>
                        <p>
                            If you have any questions about these Terms or the Services, you may contact us at:
                        </p>
                        <div className="legal-contact-info">
                            <h3 className="legal-contact-title">Parallel Parking Solutions Inc.</h3>
                            <div className="legal-contact-details">
                                <p>Email: <a href="mailto:info@parkwithparallel.com" className="legal-email">info@parkwithparallel.com</a></p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default TermsOfService_Operator;
