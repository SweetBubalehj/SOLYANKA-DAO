import React, { useState, useEffect } from "react";
import { useContractWrite, usePrepareContractWrite } from "wagmi";
import {
  Form,
  Input,
  Button,
  InputNumber,
  Switch,
  Space,
  Spin,
  Alert,
  Select,
  Collapse,
  notification,
} from "antd";
import factoryABI from "../abi/factoryABI";
import useGetIsVerified from "../utils/isIdentified";
import {
  FormOutlined,
  UserOutlined,
  MinusCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import useGetIsKYC from "../utils/isKYC";

const { Option } = Select;
const { Panel } = Collapse;

const CreateVotingForm = () => {
  const [title, setTitle] = useState("");
  const [proposalNames, setProposalNames] = useState([]);
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [quorom, setQuorom] = useState(0);
  const [isKYC, setIsKYC] = useState(false);

  const isUserKYC = useGetIsKYC();
  const isVerified = useGetIsVerified();

  const transactionIsSuccess = () => {
    notification.success({
      message: "Transaction successful",
      placement: "bottomRight",
    });
  };

  const transactionIsLoading = () =>{
    notification.warning({
      message: "Check your wallet",
      placement: "bottomRight",
    });
  }

  const { config } = usePrepareContractWrite({
    address: "0xE7cDD9eDD77fC483F927233459F4f2A04008c616",
    abi: factoryABI,
    functionName: "createVoting",
    args: [title, proposalNames, durationMinutes, quorom, isKYC],
  });

  const { isLoading, isSuccess, write } = useContractWrite(config);

  const durations = [
    { label: "1 minute", value: 1 },
    { label: "5 minutes", value: 5 },
    { label: "10 minutes", value: 10 },
    { label: "30 minutes", value: 30 },
    { label: "1 hour", value: 60 },
    { label: "1 day", value: 60 * 24 },
    { label: "1 week", value: 60 * 24 * 7 },
    { label: "1 month", value: 60 * 24 * 30 },
  ];

  const getDurationInMinutes = (value) => {
    const duration = durations.find((duration) => duration.value === value);
    return duration ? duration.value : 1;
  };

  useEffect(() => {
    if (isLoading) {
      transactionIsLoading();
    }
  }, [isLoading]);

  useEffect(() => {
    if (isSuccess) {
      transactionIsSuccess();
    }
  }, [isSuccess]);

  if (isVerified === undefined) {
    return (
      <Space
        direction="vertical"
        style={{ width: "100%", marginBottom: "50px" }}
      >
        <Spin tip="Awaiting Wallet" size="large">
          <div />
        </Spin>
      </Space>
    );
  }

  if (!isVerified) {
    return (
      <Alert
        style={{ width: "100%", marginBottom: "50px" }}
        message="You are not registered"
        description="Please identify yourself to use application."
        type="warning"
        showIcon
      />
    );
  }

  return (
    <>
      <Collapse accordion>
        <Panel header="Create voting" key="1">
          <Form layout="vertical">
            <Form.Item
              required={false}
              label="Title"
              name="title"
              tooltip="Title of the voting"
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

            <Form.List
              name="names"
              rules={[
                {
                  validator: async (_, names) => {
                    if (!names || names.length < 2) {
                      return Promise.reject(new Error("At least 2 proposals"));
                    }
                  },
                },
              ]}
            >
              {(fields, { add, remove }, { errors }) => (
                <>
                  {fields.map((field, index) => (
                    <Form.Item
                      label={index === 0 ? "Proposals" : ""}
                      tooltip={index === 0 ? "Proposals of the voting" : ""}
                      required={false}
                      key={field.key}
                    >
                      <Form.Item
                        {...field}
                        validateTrigger={["onChange", "onBlur"]}
                        rules={[
                          {
                            required: true,
                            whitespace: true,
                            message: "Please input proposal name",
                          },
                        ]}
                        noStyle
                      >
                        <Input
                          style={{}}
                          prefix={<UserOutlined style={{ color: "grey" }} />}
                          allowClear
                          value={proposalNames[index]}
                          onChange={(e) => {
                            const updatedProposalNames = [...proposalNames];
                            updatedProposalNames[index] = e.target.value;
                            setProposalNames(updatedProposalNames);
                          }}
                        />
                      </Form.Item>
                      {fields.length > 2 ? (
                        <MinusCircleOutlined
                          style={{
                            color: "grey",
                            position: "absolute",
                            marginTop: "9px",
                          }}
                          onClick={() => {
                            const updatedProposalNames = [...proposalNames];
                            updatedProposalNames.splice(index, 1);
                            setProposalNames(updatedProposalNames);
                            remove(field.name);
                          }}
                        />
                      ) : null}
                    </Form.Item>
                  ))}
                  <Form.Item style={{ textAlign: "center" }}>
                    <Button
                      type="dashed"
                      onClick={() => {
                        add();
                        const updatedProposalNames = [...proposalNames];
                        updatedProposalNames.push("");
                        setProposalNames(updatedProposalNames);
                      }}
                      style={{
                        width: "50%",
                      }}
                      icon={<PlusOutlined />}
                    >
                      Add Proposal
                    </Button>
                    <Form.ErrorList errors={errors} />
                  </Form.Item>
                </>
              )}
            </Form.List>
            <Form.Item>
              <div
                style={{
                  textAlign: "center",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <div style={{ marginRight: "10px" }}>Duration:</div>
                <Select
                  style={{ width: "110px", marginRight: "10px" }}
                  defaultValue={durations[0].value}
                  onChange={(value) =>
                    setDurationMinutes(getDurationInMinutes(value))
                  }
                >
                  {durations.map((duration) => (
                    <Option key={duration.value} value={duration.value}>
                      {duration.label}
                    </Option>
                  ))}
                </Select>
                <div style={{ marginRight: "10px" }}>Quorom:</div>
                <InputNumber
                  min={0}
                  value={quorom}
                  onChange={setQuorom}
                  style={{ width: "110px", marginRight: "10px" }}
                />
                {isUserKYC && (
                  <Switch
                    style={{ width: "80px", marginRight: "5px" }}
                    checkedChildren="KYC ON"
                    unCheckedChildren="KYC OFF"
                    onChange={setIsKYC}
                  />
                )}
              </div>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                onClick={() => write?.()}
              >
                Deploy Voting
              </Button>
            </Form.Item>
          </Form>
        </Panel>
      </Collapse>
    </>
  );
};

export default CreateVotingForm;
