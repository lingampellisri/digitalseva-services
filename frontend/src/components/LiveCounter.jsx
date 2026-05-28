import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FiFileText, FiSend, FiCheckCircle, FiStar } from 'react-icons/fi';

const COUNTERS = [
    { key: 'processed', target: 1420, suffix: '+', icon: <FiFileText />, color: 'emerald' },
    { key: 'posts', target: 500, suffix: '+', icon: <FiSend />, color: 'blue' },
    { key: 'success', target: 98, suffix: '%', icon: <FiCheckCircle />, color: 'violet' },
    { key: 'rating', target: 4.9, suffix: '★', icon: <FiStar />, color: 'amber', decimals: 1 },
];

const useCountUp = (target, duration = 2000, start = false, decimals = 0) => {
    const [count, setCount] = useState(0);
    const frameRef = useRef(null);

    useEffect(() => {
        if (!start) return;
        const startTime = performance.now();

        const animate = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(parseFloat((eased * target).toFixed(decimals)));
            if (progress < 1) {
                frameRef.current = requestAnimationFrame(animate);
            }
        };

        frameRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(frameRef.current);
    }, [start, target, duration, decimals]);

    return count;
};

const LiveCounter = () => {
    const { t } = useTranslation();
    const [visible, setVisible] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setVisible(true); },
            { threshold: 0.3 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    return (
        <section className="live-counter-section" ref={ref}>
            <div className="container">
                <div className="text-center">
                    <span className="counter-live-dot">
                        {t('liveCounter.liveLabel', 'Live Dashboard')}
                    </span>
                </div>
                <div className="live-counter-grid">
                    {COUNTERS.map(({ key, target, suffix, icon, color, decimals = 0 }) => (
                        <CounterCard
                            key={key}
                            target={target}
                            suffix={suffix}
                            icon={icon}
                            color={color}
                            decimals={decimals}
                            label={t(`liveCounter.${key}`, key)}
                            visible={visible}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

const CounterCard = ({ target, suffix, icon, color, decimals, label, visible }) => {
    const count = useCountUp(target, 2200, visible, decimals);

    return (
        <div className={`counter-card counter-card-${color}`}>
            <div className={`counter-icon counter-icon-${color}`}>
                {icon}
            </div>
            <div className="counter-number">
                {decimals > 0 ? count.toFixed(decimals) : Math.floor(count)}{suffix}
            </div>
            <div className="counter-label">{label}</div>
        </div>
    );
};

export default LiveCounter;
