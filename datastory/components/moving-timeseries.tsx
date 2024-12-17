import { useEffect } from "react";
import { AnimatedSection } from "./animated-section";
import PropTypes from "prop-types";

interface MovingTimeSeriesProps {
  visualizationId: string;
  title?: string;
}

export default function MovingTimeSeries({ visualizationId, title }: MovingTimeSeriesProps) {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://public.flourish.studio/resources/embed.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script); // Clean up the script on unmount
    };
  }, []);

  return (
    <AnimatedSection className="flex items-center justify-center h-screen">
      <div className="relative border-3 border-purple-500 inline-block">
        {/* Title box */}
        <div className="bg-red-500 text-white text-center py-2 ">
          {title}
        </div>
        {/* Embed container */}
        <div
          className="flourish-embed flourish-chart"
          data-src={`visualisation/${visualizationId}`}
          style={{ width: '1100px', height: '1100px' }} // Original size of the embed
        >
          <noscript>
            <img
              src={`https://public.flourish.studio/visualisation/${visualizationId}/thumbnail`}
              width="100%"
              alt="chart visualization"
            />
          </noscript>
        </div>
      </div>
    </AnimatedSection>
  );
}

MovingTimeSeries.propTypes = {
  visualizationId: PropTypes.string.isRequired, // Visualization ID as a required prop
  title: PropTypes.string, // Optional title prop
};

MovingTimeSeries.defaultProps = {
  title: "Time Series Visualization", // Default title if none is provided
};
