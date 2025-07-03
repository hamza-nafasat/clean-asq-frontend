import RangeSlider from 'react-range-slider-input';
import 'react-range-slider-input/dist/style.css';

const PercentageSlider = ({ percentage, handleAddOwnerPercentage }) => {
  return (
    <div className="rounded-xl bg-white p-6 shadow">
      <div className="flex items-center justify-center gap-2">
        <div className="border-primary rounded-md border-2 px-9 py-3.5 text-2xl"> {percentage}</div>
        <div className="text-2xl">%</div>
      </div>

      <RangeSlider
        min={0}
        max={100}
        defaultValue={[0, percentage]} // Left thumb is fixed at 0
        onInput={([_, value]) => handleAddOwnerPercentage(value)} // Only track right thumb
        thumbsDisabled={[true, false]} // Left disabled, right enabled
        rangeSlideDisabled={true} // Prevent range dragging
        className="mt-4 bg-red-500"
      />
    </div>
  );
};

export default PercentageSlider;
