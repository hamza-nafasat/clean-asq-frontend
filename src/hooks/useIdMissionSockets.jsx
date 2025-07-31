import { useEffect } from 'react';
import { socket } from '@/main';

export const useIdMissionSockets = () => {
  useEffect(() => {
    socket.on('idMission_verified', data => {
      console.log('✅ You are verified successfully', data);
    });

    socket.on('idMission_processing_started', data => {
      console.log('🚀 You started ID mission verification', data);
    });

    return () => {
      socket.off('idMission_verified');
      socket.off('idMission_processing_started');
    };
  }, []);
};
