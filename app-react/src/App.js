import { Layout, Typography, Menu, Col, Row } from "antd";
import "@rainbow-me/rainbowkit/styles.css";
import { ConnectButton, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiConfig } from "wagmi";
import CreateVotingForm from "./components/CreateVotingForm";
import CreateIdentityForm from "./components/СreateIdentity";
import VotingList from "./components/VotingList";
import { getDefaultWallets } from "@rainbow-me/rainbowkit";
import { bscTestnet } from "wagmi/chains";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import { publicProvider } from "wagmi/providers/public";
import { configureChains, createClient } from "wagmi";
import { GlobalOutlined } from "@ant-design/icons";
import { useState } from "react";
import "./App.css";
import IdentityInfoForm from "./components/IdentityInfo";

const { Header, Content } = Layout;
const { Title, Paragraph } = Typography;

const { chains, provider } = configureChains(
  [bscTestnet],
  [
    jsonRpcProvider({
      rpc: (bscTestnet) => ({
        http: "https://data-seed-prebsc-1-s1.binance.org:8545/",
      }),
    }),
    publicProvider(),
  ]
);

const { connectors } = getDefaultWallets({
  appName: "My RainbowKit App",
  chains,
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

const App = () => {
  const [contentKey, setContentKey] = useState("welcome");

  const renderContent = () => {
    switch (contentKey) {
      case "welcome":
        return (
          <div style={{ textAlign: "center" }}>
            <Title level={1}>Welcome to SOLYANKA DAO</Title>
            <Paragraph>
              This is the home page of SOLYANKA DAO. Click on the "Votings" menu
              item to access the main features. Click "Profile" to go to your
              profile.
            </Paragraph>
          </div>
        );
      case "votings":
        return (
          <>
            <WagmiConfig client={wagmiClient}>
              <CreateVotingForm />
            </WagmiConfig>

            <WagmiConfig client={wagmiClient}>
              <CreateIdentityForm />
            </WagmiConfig>

            <WagmiConfig client={wagmiClient}>
              <VotingList />
            </WagmiConfig>
          </>
        );
      case "profile":
        return (
          <div style={{ textAlign: "center" }}>
            <WagmiConfig client={wagmiClient}>
              <IdentityInfoForm />
            </WagmiConfig>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Layout>
      <Header>
        <Row justify="space-between" align="middle">
          <Col style={{ display: "flex", alignItems: "center" }}>
            <GlobalOutlined
              style={{ fontSize: "24px", color: "white", marginRight: "8px" }}
            />
            <Title level={3} style={{ color: "white", margin: 0 }}>
              SOLYANKA DAO
            </Title>
          </Col>
          <Col>
            <Menu
              defaultSelectedKeys={["welcome"]}
              theme="dark"
              mode="horizontal"
              onClick={({ key }) => setContentKey(key)}
            >
              <Menu.Item key="welcome">Welcome</Menu.Item>
              <Menu.Item key="votings">Votings</Menu.Item>
              <Menu.Item key="profile">Profile</Menu.Item>
            </Menu>
          </Col>
          <Col>
            <WagmiConfig client={wagmiClient}>
              <RainbowKitProvider chains={chains}>
                <ConnectButton />
              </RainbowKitProvider>
            </WagmiConfig>
          </Col>
        </Row>
      </Header>
      <Content
        style={{
          margin: "0 auto",
          padding: "50px",
          width: "50%",
          minWidth: "750px",
        }}
      >
        {renderContent()}
      </Content>
    </Layout>
  );
};

export default App;
