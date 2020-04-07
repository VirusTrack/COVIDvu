import { useSelector } from 'react-redux';

export function useGraphData(region) {
  const confirmed = useSelector((state) => state.services[region].confirmed);
  const sortedConfirmed = useSelector((state) => state.services[region].sortedConfirmed);
  const deaths = useSelector((state) => state.services[region].deaths);
  const mortality = useSelector((state) => state.services[region].mortality);

  return {
    confirmed, sortedConfirmed, deaths, mortality,
  };
}
