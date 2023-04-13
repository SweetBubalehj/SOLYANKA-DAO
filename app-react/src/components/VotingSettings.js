import { useContractWrite, usePrepareContractWrite } from "wagmi";
import {
  Form,
  Input,
  Button,
  InputNumber,
  Divider,
  notification,
} from "antd";
import { useState, useEffect } from "react";
import { Collapse } from "antd";
import { FormOutlined } from "@ant-design/icons";
import { ABI } from "../contracts/votingContract";

const { Panel } = Collapse;

const VotingSettings = ({ votingAddress }) => {
  const [title, setTitle] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(10);

  const transactionIsSuccess = () => {
    notification.success({
      message: "Transaction successful",
      placement: "bottomRight",
    });
  };

  const transactionIsLoading = () => {
    notification.warning({
      message: "Check your wallet",
      placement: "bottomRight",
    });
  };

  const { config: titleConfig } = usePrepareContractWrite({
    address: votingAddress,
    abi: ABI,
    functionName: "changeTitle",
    args: [title],
  });
  const {
    isLoading: titleLoading,
    isSuccess: titleSuccess,
    write: changeTitle,
  } = useContractWrite(titleConfig);

  const { config: durationConfig } = usePrepareContractWrite({
    address: votingAddress,
    abi: ABI,
    functionName: "addDurationTime",
    args: [durationMinutes],
  });
  const {
    isLoading: durationLoading,
    isSuccess: durationSuccess,
    write: addDurationTime,
  } = useContractWrite(durationConfig);

  useEffect(() => {
    if (titleLoading || durationLoading) {
      transactionIsLoading();
    }

    if (titleSuccess || durationSuccess) {
      transactionIsSuccess();
    }
  }, [
    titleLoading,
    titleSuccess,
    durationLoading,
    durationSuccess,
  ]);

  return (
    <>
      <Collapse accordion style={{ marginBottom: "20px" }}>
        <Panel header="Voting settings" key="1">
          <Form>
            <Form.Item
              required={false}
              label="Title"
              name="title"
              rules={[
                {
                  required: true,
                  whitespace: true,
                  message: "Please input title",
                },
              ]}
            >
              <Input
                prefix={<FormOutlined style={{ color: "grey" }} />}
                allowClear
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </Form.Item>
            <Form.Item
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
              }}
            >
              <Button danger htmlType="submit" onClick={() => changeTitle?.()}>
                Change Title
              </Button>
            </Form.Item>
          </Form>
          <Divider />
          <Form>
          </Form>
          <Form>
            <Form.Item>
              <div
                style={{
                  textAlign: "center",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <div style={{ marginRight: "10px" }}>Minutes:</div>
                <InputNumber
                  style={{ marginRight: "10px" }}
                  min={1}
                  max={10080}
                  value={durationMinutes}
                  onChange={setDurationMinutes}
                />
                <Button
                  danger
                  htmlType="submit"
                  onClick={() => addDurationTime?.()}
                >
                  Add Time
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Panel>
      </Collapse>
    </>
  );
};

export default VotingSettings;
