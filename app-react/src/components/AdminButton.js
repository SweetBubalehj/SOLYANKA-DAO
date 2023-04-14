import React, { useEffect, useState } from "react";
import {
  useContractRead,
  useAccount,
  useContractWrite,
  usePrepareContractWrite,
} from "wagmi";
import { Address, ABI } from "../contracts/sbtContract";
import useGetIsModerator from "../utils/isModerator";
import useGetIsAdmin from "../utils/isAdmin";
import { Card, Typography, Modal, Form, Input, Button } from "antd";

const { Title, Text } = Typography;

const AdminModeratorButtons = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddingModerator, setIsAddingModerator] = useState(true);
  //Contract part
  const { address } = useAccount();

  const [addr, setAddr] = useState("");

  const { config: addModeratorConfig } = usePrepareContractWrite({
    address: Address,
    abi: ABI,
    functionName: "addModerator",
    args: [addr],
  });

  const { data: addModeratorData, write: addModerator } =
    useContractWrite(addModeratorConfig);

  const { config: removeModeratorConfig } = usePrepareContractWrite({
    address: Address,
    abi: ABI,
    functionName: "removeModerator",
    args: [addr],
  });

  const { data: removeModeratorData, write: removeModerator } =
    useContractWrite(removeModeratorConfig);

  //Modal part
  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleAddModerator = () => {
    setIsAddingModerator(true);
    showModal();
  };

  const handleRemoveModerator = () => {
    setIsAddingModerator(false);
    showModal();
  };

  const handleOk = () => {
    setIsModalOpen(false);
    if (isAddingModerator) {
      addModerator?.();
    } else {
      removeModerator?.();
    }
  };

  //

  //Admin and Moderator part
  const isAdmin = useGetIsAdmin();
  //
  return (
    <>
      {isAdmin && (
        <Card title="">
          <Modal
            title={isAddingModerator ? "Add moderator" : "Remove moderator"}
            open={isModalOpen}
            onOk={handleOk}
            onCancel={() => setIsModalOpen(false)}
          >
            <Form>
              <Form.Item label="Address" name="username">
                <Input onChange={(e) => setAddr(e.target.value)} />
              </Form.Item>
            </Form>
          </Modal>
          <div>
            <Button type="primary" onClick={handleAddModerator}>
              Add moderator
            </Button>
            <Button type="primary" onClick={handleRemoveModerator}>
              Remove moderator
            </Button>
          </div>
        </Card>
      )}
    </>
  );
};

export default AdminModeratorButtons;
