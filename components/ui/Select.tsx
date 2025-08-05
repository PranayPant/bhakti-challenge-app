import { useState } from 'react';
import { Button, Menu } from 'react-native-paper';

export interface SelectProps {
  btnText: string;
  btnClass?: string;
  options: { label: string; value: string }[];
  onSelect: (value: string) => void;
}
export const Select = ({ btnText, options, btnClass, onSelect }: SelectProps) => {
  const [visible, setVisible] = useState(false);

  const openMenu = () => setVisible(true);

  const closeMenu = () => setVisible(false);
  return (
    <Menu
      visible={visible}
      onDismiss={closeMenu}
      anchorPosition="bottom"
      anchor={
        <Button compact mode="contained" buttonColor="#eab308" onPress={openMenu}>
          {btnText}
        </Button>
      }>
      {options.map((option) => (
        <Menu.Item
          key={option.value}
          title={option.label}
          onPress={() => {
            onSelect(option.value);
            closeMenu();
          }}
        />
      ))}
    </Menu>
  );
};
