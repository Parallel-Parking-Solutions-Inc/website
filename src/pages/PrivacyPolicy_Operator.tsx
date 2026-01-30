import React from 'react';
import './Legal.css';

const PrivacyPolicy_Operator: React.FC = () => {
    const isOperatorRedirect = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('redirect-from-operator');

    const handleReturnToOperator = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        window.close();
    };

    return (
        <div className="legal-page-container">
            <div className="legal-header">
                <h1 className="legal-title">Privacy Policy: Operator</h1>
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
                    <a href="/legal/operator/terms-of-service" className="legal-nav-link prev">
                        <span className="legal-nav-arrow">←</span>
                        Operator Terms of Service
                    </a>
                    {!isOperatorRedirect && <div></div>}
                </div>
            </div>

            <div className="legal-content">
                <section className="legal-section" id="introduction">
                    <h2 className="legal-section-title">1. Introduction</h2>
                    <div className="legal-section-content">
                        <p>
                            Parallel Parking Solutions Inc. ("we", "us", or "our") respects your privacy and is committed to protecting your personal information.
                            This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Parallel Operator Portal ("Service").
                            This Privacy Policy applies specifically to business users and parking operators using the Operator Portal to manage parking lot sessions, rates, registry data, and facility analytics. For consumer-related data and mobile app users, refer to our <a href="/legal/app/privacy-policy" className="legal-link" target="_blank" rel="noopener noreferrer">App Privacy Policy</a>.
                        </p>
                    </div>
                </section>

                <section className="legal-section" id="information-collection">
                    <h2 className="legal-section-title">2. Information We Collect</h2>
                    <div className="legal-section-content">
                        <div className="legal-subsection">
                            <h3 className="legal-subsection-title">Personal Information</h3>
                            <div className="legal-subsection-content">
                                <p>We collect personal information that you provide directly to us, including:</p>
                                <ul className="legal-list">
                                    <li className="legal-list-item">Name and contact information (email address, phone number)</li>
                                    <li className="legal-list-item">Account credentials and authentication data</li>
                                    <li className="legal-list-item">Profile information and preferences</li>
                                    <li className="legal-list-item">Payment and billing information</li>
                                    <li className="legal-list-item">Communications and support requests</li>
                                </ul>
                            </div>
                        </div>

                        <div className="legal-subsection">
                            <h3 className="legal-subsection-title">Parking and Vehicle Data</h3>
                            <div className="legal-subsection-content">
                                <p>Through our parking management system, we collect:</p>
                                <ul className="legal-list">
                                    <li className="legal-list-item">License plate numbers and vehicle identification data</li>
                                    <li className="legal-list-item">Vehicle entry and exit timestamps</li>
                                    <li className="legal-list-item">Parking session duration and location data</li>
                                    <li className="legal-list-item">Occupancy and traffic flow metrics</li>
                                    <li className="legal-list-item">Registry data for authorized vehicles</li>
                                </ul>
                                <p>
                                    If you input personal or vehicle data of third parties (such as customers or employees), you are responsible for ensuring you have the appropriate legal right or consent to do so.
                                </p>
                            </div>
                        </div>

                        <div className="legal-subsection">
                            <h3 className="legal-subsection-title">Technical Information</h3>
                            <div className="legal-subsection-content">
                                <p>We automatically collect certain information when you use our Service:</p>
                                <ul className="legal-list">
                                    <li className="legal-list-item">Device information (IP address, browser type, operating system)</li>
                                    <li className="legal-list-item">Usage data and analytics</li>
                                    <li className="legal-list-item">Log files and system activity</li>
                                    <li className="legal-list-item">Cookies and similar tracking technologies</li>
                                </ul>
                            </div>
                        </div>

                        <div className="legal-subsection">
                            <h3 className="legal-subsection-title">Mobile App Integration Data</h3>
                            <div className="legal-subsection-content">
                                <p>
                                    As part of our integrated parking management system, we receive data from mobile app users who park in your facilities. This includes:
                                </p>
                                <ul className="legal-list">
                                    <li className="legal-list-item">License plate numbers and vehicle identification data from ALPR systems</li>
                                    <li className="legal-list-item">Vehicle entry and exit timestamps</li>
                                    <li className="legal-list-item">Parking session duration and payment status</li>
                                    <li className="legal-list-item">Violation records and enforcement data</li>
                                </ul>
                                <p>
                                    This data is collected automatically through our ALPR systems and is essential for managing your parking operations. For detailed information about how this data is collected from app users, please refer to our <a href="/legal/app/privacy-policy" className="legal-link" target="_blank" rel="noopener noreferrer">App Privacy Policy</a>.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="legal-section" id="information-use">
                    <h2 className="legal-section-title">3. How We Use Your Information</h2>
                    <div className="legal-section-content">
                        <p>We use the collected information for various purposes including:</p>
                        <ul className="legal-list">
                            <li className="legal-list-item">Providing and maintaining the Service</li>
                            <li className="legal-list-item">Processing parking transactions and payments</li>
                            <li className="legal-list-item">Managing user accounts and authentication</li>
                            <li className="legal-list-item">Generating analytics and reporting</li>
                            <li className="legal-list-item">Improving Service functionality and user experience</li>
                            <li className="legal-list-item">Communicating with users about Service updates, security alerts, billing, and operational notifications related to their lots</li>
                            <li className="legal-list-item">Ensuring security and preventing fraud</li>
                            <li className="legal-list-item">Complying with legal obligations</li>
                        </ul>
                    </div>
                </section>

                <section className="legal-section" id="legal-basis">
                    <h2 className="legal-section-title">4. Legal Basis for Processing</h2>
                    <div className="legal-section-content">
                        <p>
                            We process your personal data based on your consent, performance of a contract, legitimate business interests, and compliance with legal obligations, as applicable under Canadian and U.S. data protection laws.
                        </p>
                    </div>
                </section>

                <section className="legal-section" id="information-sharing">
                    <h2 className="legal-section-title">5. Information Sharing and Disclosure</h2>
                    <div className="legal-section-content">
                        <p>We share limited information with third parties as necessary to deliver core service functions:</p>
                        <ul className="legal-list">
                            <li className="legal-list-item"><strong>Stripe:</strong> To process payments and refunds for operator services</li>
                            <li className="legal-list-item"><strong>Firebase:</strong> To enable push notifications and real-time data synchronization</li>
                            <li className="legal-list-item"><strong>AWS Simple Notification Service (SNS):</strong> To send verification and system-related communications</li>
                            <li className="legal-list-item"><strong>Amazon Web Services (AWS):</strong> To host our secure cloud database infrastructure</li>
                            <li className="legal-list-item"><strong>Vaxtor Technologies:</strong> For ALPR software processing and license plate recognition</li>
                            <li className="legal-list-item"><strong>i-PRO:</strong> For camera hardware and imaging systems</li>
                        </ul>
                        <p>
                            We also share session-level data with mobile app users through our integrated system. This includes license plates scanned in operator lots, timestamps, and violation status. App users do not receive any operator-identifying information such as business names, contact details, or internal operational data.
                        </p>
                        <p>
                            We do not sell, rent, or trade your personal information to any third parties for marketing or advertising purposes, and we do not operate a marketing email program. Operational emails and lot notifications are transactional; you can manage lot notification settings and your contact email in the Operator Portal.
                        </p>
                    </div>
                </section>

                <section className="legal-section" id="ai-insights">
                    <h2 className="legal-section-title">6. AI Insights and Automation</h2>
                    <div className="legal-section-content">
                        <p>
                            Certain features of the Operator Portal leverage artificial intelligence to summarize chat requests, recommend operational
                            changes, or pre-fill agent payloads. When you enable these tools, the underlying conversation, lot context, and confirmation
                            history may be processed by Parallel-operated models and audited to improve accuracy, safety, and abuse detection. AI output
                            is never applied without an operator’s confirmation, and all payloads are stored in accordance with this Privacy Policy.
                        </p>
                        <p>
                            We do not sell AI-generated content or the associated telemetry to third parties, and no lot data is sent to model
                            providers for AI features unless you choose to use them. We may use anonymized and aggregated statistics to evaluate
                            performance, measure quality, and design new safeguards. You may disable AI functionality for a lot at any time by
                            contacting Parallel support; doing so will stop new conversations from being routed through AI, but historical
                            confirmations may continue to be retained for compliance and security purposes.
                        </p>
                    </div>
                </section>

                <section className="legal-section" id="data-retention">
                    <h2 className="legal-section-title">7. Data Retention</h2>
                    <div className="legal-section-content">
                        <p>
                            We retain personal information for as long as necessary to provide the Service and fulfill the purposes outlined in this Privacy Policy.
                            We may retain certain information for longer periods as required by law or for legitimate business purposes.
                        </p>
                        <ul className="legal-list">
                            <li className="legal-list-item">Account information: Retained while account is active and for a reasonable period after closure</li>
                            <li className="legal-list-item">Parking session data: Retained for analytical and billing purposes as required by business operations</li>
                            <li className="legal-list-item">System logs: Retained for security and troubleshooting purposes</li>
                        </ul>
                    </div>
                </section>

                <section className="legal-section" id="data-security">
                    <h2 className="legal-section-title">8. Data Security</h2>
                    <div className="legal-section-content">
                        <p>
                            We implement appropriate technical and organizational measures to protect your personal information against unauthorized access,
                            alteration, disclosure, or destruction. These measures include:
                        </p>
                        <ul className="legal-list">
                            <li className="legal-list-item">Encryption of data in transit and at rest</li>
                            <li className="legal-list-item">Access controls and authentication systems</li>
                            <li className="legal-list-item">Regular security assessments and updates</li>
                            <li className="legal-list-item">Staff training on data protection practices</li>
                        </ul>
                        <p>
                            However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
                        </p>
                    </div>
                </section>

                <section className="legal-section" id="user-rights">
                    <h2 className="legal-section-title">9. Your Rights and Choices</h2>
                    <div className="legal-section-content">
                        <p>Depending on your location, you may have certain rights regarding your personal information:</p>
                        <ul className="legal-list">
                            <li className="legal-list-item"><strong>Access:</strong> Request access to your personal information</li>
                            <li className="legal-list-item"><strong>Correction:</strong> Request correction of inaccurate information</li>
                            <li className="legal-list-item"><strong>Deletion:</strong> Request deletion of your personal information</li>
                            <li className="legal-list-item"><strong>Portability:</strong> Request transfer of your data to another service</li>
                            <li className="legal-list-item"><strong>Objection:</strong> Object to certain processing of your information</li>
                        </ul>
                        <p>To exercise these rights, please contact us using the information provided below.</p>
                    </div>
                </section>

                <section className="legal-section" id="cookies">
                    <h2 className="legal-section-title">10. Cookies and Tracking Technologies</h2>
                    <div className="legal-section-content">
                        <p>
                            We use cookies and similar tracking technologies to enhance your experience with our Service.
                            These technologies help us remember your preferences, analyze usage patterns, and improve functionality.
                        </p>
                        <p>
                            You can control cookie settings through your browser preferences, but disabling cookies may affect the functionality of the Service.
                        </p>
                    </div>
                </section>

                <section className="legal-section" id="third-party-services">
                    <h2 className="legal-section-title">11. Third-Party Services</h2>
                    <div className="legal-section-content">
                        <p>
                            Our Service may contain links to third-party websites or integrate with third-party services.
                            We are not responsible for the privacy practices of these third parties. We encourage you to review their privacy policies.
                        </p>
                    </div>
                </section>

                <section className="legal-section" id="international-transfers">
                    <h2 className="legal-section-title">12. International Data Transfers</h2>
                    <div className="legal-section-content">
                        <p>
                            Your information may be transferred to and maintained on computers located outside of your jurisdiction where data protection laws may differ.
                            We take appropriate measures to ensure your information receives adequate protection.
                        </p>
                    </div>
                </section>

                <section className="legal-section" id="children-privacy">
                    <h2 className="legal-section-title">13. Children's Privacy</h2>
                    <div className="legal-section-content">
                        <p>
                            The Operator Portal is intended for business use only and is not marketed or available for children under the age of 13.
                        </p>
                    </div>
                </section>

                <section className="legal-section" id="policy-updates">
                    <h2 className="legal-section-title">14. Changes to This Privacy Policy</h2>
                    <div className="legal-section-content">
                        <p>
                            We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page
                            and updating the "Last Updated" date. Your continued use of the Service after such changes constitutes acceptance of the updated Privacy Policy.
                        </p>
                    </div>
                </section>

                <section className="legal-section" id="contact">
                    <h2 className="legal-section-title">15. Contact Information</h2>
                    <div className="legal-section-content">
                        <p>
                            If you have any questions about this Privacy Policy or our privacy practices, please contact us at:
                        </p>
                        <div className="legal-contact-info">
                            <h3 className="legal-contact-title">Parallel Parking Solutions Inc.</h3>
                            <div className="legal-contact-details">
                                <p>Email: <a href="mailto:info@parkwithparallel.com" className="legal-email">info@parkwithparallel.com</a></p>
                            </div>
                        </div>
                        <p>
                            As the Service is currently available in Canada and the United States only, applicable laws from these jurisdictions will apply.
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default PrivacyPolicy_Operator;
