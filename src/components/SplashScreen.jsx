import React from 'react';
import styled, { keyframes } from 'styled-components';

const pulse = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.12); opacity: 0.92; }
  100% { transform: scale(1); opacity: 1; }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const SplashOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: #fff;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const Icon = styled.img`
  width: 400px;
  height: 400px;
  animation: ${pulse} 1.2s ease-in-out infinite;
  user-select: none;
`;

const AppName = styled.div`
  margin-top: 1.5rem;
  font-size: 2.1rem;
  font-weight: bold;
  color: #ff9800;
  letter-spacing: 1px;
  font-family: 'Segoe UI', Arial, sans-serif;
  animation: ${fadeIn} 0.8s 0.3s both;
`;

const SplashScreen = () => (
  <SplashOverlay>
    <Icon src="/dental-ceph.png" alt="DentalCeph" draggable={false} />
    <AppName>DentalCeph</AppName>
  </SplashOverlay>
);

export default SplashScreen; 