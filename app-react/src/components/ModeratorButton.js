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
import { Card, Typography, Modal, Form, Input, Button, Checkbox } from "antd";

const { Title, Text } = Typography;

const ModeratorButtons = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [componentDisabled, setComponentDisabled] = useState(true);
  //Contract part
  const { address } = useAccount();

  const [addrSoul, setAddrSoul] = useState("");

  const { config } = usePrepareContractWrite({
    address: Address,
    abi: ABI,
    functionName: "turnKYC",
    args: [addrSoul, !componentDisabled],
  });

  const {
    data: contractInfo,
    isLoading,
    isSuccess,
    write,
  } = useContractWrite(config);

  //Modal part
  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    const kyc = !componentDisabled;
    write?.();
    //setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };
  //

  //Admin and Moderator part
  const isModerator = useGetIsModerator();
  console.log(isModerator);
  //
  return (
    <>
      {isModerator && (
        <Card title="">
          <Modal
            title="Set KYC status for a soul"
            open={isModalOpen}
            onOk={handleOk}
            onShow={showModal}
            onCancel={handleCancel}
          >
            <Form>
              <Form.Item label="Soul address" name="addrSoul">
                <Input
                  value={addrSoul}
                  onChange={(e) => setAddrSoul(e.target.value)}
                />
              </Form.Item>

              <Form.Item label="KYC?" name="kyc">
                <Checkbox
                  checked={!componentDisabled}
                  onChange={(e) => setComponentDisabled(!e.target.checked)}
                />
              </Form.Item>
            </Form>
          </Modal>
          <Button type="primary" onClick={showModal}>
            Moderator options
          </Button>
        </Card>
      )}
    </>
  );
};

export default ModeratorButtons;
