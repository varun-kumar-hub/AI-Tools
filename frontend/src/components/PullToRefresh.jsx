import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw } from 'lucide-react';

const PullToRefresh = ({ onRefresh, children }) => {
    const [startPoint, setStartPoint] = useState(0);
    const [pullChange, setPullChange] = useState(0);
    const [refreshing, setRefreshing] = useState(false);
    const contentRef = useRef(null);

    const pullThreshold = 120; // px to drag to trigger refresh

    const initTouch = (e) => {
        // Only enable if we are at the top of the page
        if (window.scrollY === 0) {
            setStartPoint(e.targetTouches[0].clientY);
        }
    };

    const touchMove = (e) => {
        if (startPoint > 0 && !refreshing && window.scrollY === 0) {
            const touchY = e.targetTouches[0].clientY;
            const pull = touchY - startPoint;

            // Only allow pulling down
            if (pull > 0) {
                // Add resistance logging function to make it feel natural
                // pullChange = (pull_distance) * resistance_factor
                setPullChange(pull < 250 ? pull : 250 + (pull - 250) * 0.3);

                // Prevent default only if we are effectively pulling to refresh
                // This prevents native scrolling when we want to PTR
                if (pull > 10 && e.cancelable) {
                    // Careful with preventing default on passive listeners, 
                    // React synthetic events might handle this, but browser native won't lets test
                }
            }
        }
    };

    const endTouch = () => {
        if (startPoint > 0) {
            if (pullChange > pullThreshold) {
                // Trigger refresh
                setRefreshing(true);
                setPullChange(60); // Snap to loading position
                triggerRefresh();
            } else {
                // Cancel refresh
                setRefreshing(false);
                setPullChange(0);
            }
        }
        setStartPoint(0);
    };

    const triggerRefresh = async () => {
        try {
            await onRefresh();
        } catch (error) {
            console.error("Refresh failed", error);
        } finally {
            setTimeout(() => {
                setRefreshing(false);
                setPullChange(0);
            }, 500); // Minimum showing time
        }
    };

    return (
        <div
            ref={contentRef}
            className="min-h-screen relative"
            onTouchStart={initTouch}
            onTouchMove={touchMove}
            onTouchEnd={endTouch}
        >
            {/* Refresh Indicator */}
            <div
                className="absolute top-0 left-0 w-full flex justify-center items-center pointer-events-none"
                style={{
                    height: pullChange,
                    opacity: Math.min(pullChange / pullThreshold, 1),
                    transition: refreshing ? 'height 0.3s' : 'none',
                    zIndex: 50 // Below navbar but visible if content pushed down? Actually let's put it above content
                }}
            >
                <div className={`p-2 rounded-full bg-black/50 backdrop-blur-md border border-white/10 ${refreshing ? 'animate-spin' : ''} shadow-xl`}>
                    <RefreshCw className={`w-6 h-6 text-purple-400 ${!refreshing ? 'transform transition-transform' : ''}`} style={{ transform: !refreshing ? `rotate(${pullChange * 2}deg)` : undefined }} />
                </div>
            </div>

            {/* Content Container */}
            <div
                style={{
                    transform: `translateY(${pullChange}px)`,
                    transition: refreshing ? 'transform 0.3s' : 'none' // Immediate movement on drag, smooth snap on release
                }}
            >
                {children}
            </div>
        </div>
    );
};

export default PullToRefresh;
