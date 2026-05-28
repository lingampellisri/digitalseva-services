import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiDollarSign, FiChevronDown, FiCheckCircle } from 'react-icons/fi';

const SERVICES = [
    { key: 'pan', fee: 107 },
    { key: 'aadhaar', fee: 50 },
    { key: 'passport', fee: 1500 },
    { key: 'incCert', fee: 150 },
    { key: 'casteCert', fee: 150 },
    { key: 'rationCard', fee: 200 },
    { key: 'drivingLicense', fee: 500 },
    { key: 'voterID', fee: 100 },
];

const FeeEstimator = () => {
    const { t } = useTranslation();
    const [selected, setSelected] = useState(SERVICES[0].key);

    const current = SERVICES.find(s => s.key === selected) || SERVICES[0];

    return (
        <div className="fee-estimator-card">
            <div className="fee-header">
                <div className="fee-header-icon">
                    <FiDollarSign size={20} />
                </div>
                <h4>{t('feeEstimator.title', 'Fee Estimator')}</h4>
            </div>

            <div className="fee-select-wrapper">
                <select
                    className="fee-select"
                    value={selected}
                    onChange={e => setSelected(e.target.value)}
                    id="fee-estimator-select"
                >
                    {SERVICES.map(s => (
                        <option key={s.key} value={s.key}>
                            {t(`feeEstimator.services.${s.key}`, s.key)}
                        </option>
                    ))}
                </select>
                <div className="fee-select-arrow">
                    <FiChevronDown size={18} />
                </div>
            </div>

            <div className="fee-result">
                <div className="fee-amount">₹{current.fee}</div>
                <div className="fee-service-name">
                    {t(`feeEstimator.services.${current.key}`, current.key)}
                </div>
                <div className="fee-guarantee">
                    <FiCheckCircle size={14} />
                    {t('feeEstimator.guarantee', 'Pay only after completion')}
                </div>
            </div>
        </div>
    );
};

export default FeeEstimator;
