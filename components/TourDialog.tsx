import { useEffect, useState } from 'react';
import { Button, Dialog, Portal, Text } from 'react-native-paper';
import { useTourGuideController } from 'rn-tourguide';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function TourPortal() {
  const [visible, setVisible] = useState(false);
  const { canStart, start, eventEmitter } = useTourGuideController();
  const [tourStarted, setTourStarted] = useState(false);

  async function handleTourState() {
    const hasSeenTour = Boolean(await AsyncStorage.getItem('seen-tour'));
    if (!hasSeenTour) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }

  const handleTourEnd = async () => {
    await AsyncStorage.setItem('seen-tour', 'true');
    setVisible(false);
  };

  const handleTour = () => {
    setVisible(false);
    // NOTE: used as workaround for iOS tour not having backdrop on first step
    if (canStart) {
      start(1);
      setTourStarted(true);
    }
  };

  // NOTE: used as workaround for iOS tour not having backdrop on first step
  useEffect(() => {
    if (tourStarted) {
      setTimeout(() => {
        start(1);
        setTourStarted(false);
      }, 0);
    }
  }, [tourStarted, start]);

  useEffect(() => {
    eventEmitter?.on('stop', handleTourEnd);
    return () => {
      eventEmitter?.off('stop', handleTourEnd);
    };
  }, [eventEmitter]);

  useEffect(() => {
    handleTourState();
  }, []);

  return (
    <Portal>
      <Dialog visible={visible}>
        <Dialog.Title>Start Tour</Dialog.Title>
        <Dialog.Content>
          <Text>Would you like to take a tour of the app?</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={handleTourEnd}>No, thanks</Button>
          <Button onPress={handleTour}>Yes, let&apos;s go!</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
