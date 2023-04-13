import { useState, useEffect } from "react";
// import { ConnectButton } from "@rainbow-me/rainbowkit";
import {Button, Modal} from "antd";

const StakingCards = () => {

    const [isModalStakingOpen, setIsModalStakingOpen] = useState(false);
    const [isModalRewardOpen, setisModalRewardOpen] = useState(false);
    const [isModalBalanceOpen, setIsModalBalanceOpen] = useState(false);
    // const [balance, setBalance] = useState(null);
  
    // useEffect(() => {
    //   async function updateBalance() {
    //     const newBalance = await myBalance();
    //     setBalance(newBalance);
    //   }
    //   updateBalance();
    // }, [token, signer]);
  
  const showModalStaking = () => {
    setIsModalStakingOpen(true);
  };
  
  const handleApprove = () => {
    // document.getElementById()
    // approveTokenIn()
  }
  
  const showModalReward = () => {
    setisModalRewardOpen(true);
  };
  
  const showModalBalance = () => {
    setIsModalBalanceOpen(true);
  };
  
  const handleOkStaking = () => {
    setIsModalStakingOpen(false);
  };
  
  const handleOkReward = () => {
    setisModalRewardOpen(false);
  };
  const handleOkBalance = () => {
    setIsModalBalanceOpen(false);
  };
  
  const handleCancel = () => {
    setIsModalStakingOpen(false);
    setisModalRewardOpen(false);
    setIsModalBalanceOpen(false);
  };


    return (
          <div style={{backgroundColor: '#f5f5f5', display: 'flex', flexDirection: 'row'}} >
            <div className='check' onClick={showModalStaking}>
            <svg style={{backgroundColor: 'lightblue', borderRadius: '50px', padding: '10%', height: '100%', width: '50%'}} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M384 160c-17.7 0-32-14.3-32-32s14.3-32 32-32H544c17.7 0 32 14.3 32 32V288c0 17.7-14.3 32-32 32s-32-14.3-32-32V205.3L342.6 374.6c-12.5 12.5-32.8 12.5-45.3 0L192 269.3 54.6 406.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l160-160c12.5-12.5 32.8-12.5 45.3 0L320 306.7 466.7 160H384z"/></svg>
            <h2 style={{fontFamily: "'Delicious Handrawn', cursive;"}}>Staking</h2>
            </div>
            <div className='check' onClick={showModalReward}>
            <svg style={{backgroundColor: 'lightgreen', borderRadius: '50px', padding: '10%', height: '100%', width: '50%'}} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M64 64C28.7 64 0 92.7 0 128V384c0 35.3 28.7 64 64 64H512c35.3 0 64-28.7 64-64V128c0-35.3-28.7-64-64-64H64zm64 320H64V320c35.3 0 64 28.7 64 64zM64 192V128h64c0 35.3-28.7 64-64 64zM448 384c0-35.3 28.7-64 64-64v64H448zm64-192c-35.3 0-64-28.7-64-64h64v64zM288 160a96 96 0 1 1 0 192 96 96 0 1 1 0-192z"/></svg>
            <h2 style={{fontFamily: "'Delicious Handrawn', cursive;"}}>Get Reward</h2>
            </div>
            <div className='check' onClick={showModalBalance}>
            <svg style={{backgroundColor: 'pink', borderRadius: '50px', padding: '10%', height: '100%', width: '50%'}}  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M400 96l0 .7c-5.3-.4-10.6-.7-16-.7H256c-16.5 0-32.5 2.1-47.8 6c-.1-2-.2-4-.2-6c0-53 43-96 96-96s96 43 96 96zm-16 32c3.5 0 7 .1 10.4 .3c4.2 .3 8.4 .7 12.6 1.3C424.6 109.1 450.8 96 480 96h11.5c10.4 0 18 9.8 15.5 19.9l-13.8 55.2c15.8 14.8 28.7 32.8 37.5 52.9H544c17.7 0 32 14.3 32 32v96c0 17.7-14.3 32-32 32H512c-9.1 12.1-19.9 22.9-32 32v64c0 17.7-14.3 32-32 32H416c-17.7 0-32-14.3-32-32V448H256v32c0 17.7-14.3 32-32 32H192c-17.7 0-32-14.3-32-32V416c-34.9-26.2-58.7-66.3-63.2-112H68c-37.6 0-68-30.4-68-68s30.4-68 68-68h4c13.3 0 24 10.7 24 24s-10.7 24-24 24H68c-11 0-20 9-20 20s9 20 20 20H99.2c12.1-59.8 57.7-107.5 116.3-122.8c12.9-3.4 26.5-5.2 40.5-5.2H384zm64 136a24 24 0 1 0 -48 0 24 24 0 1 0 48 0z"/></svg>
            <h2 style={{fontFamily: "'Delicious Handrawn', cursive;"}}>My balance</h2>
            </div>
                <Modal footer={[<Button key="Approve" onClick={handleApprove}>
                    Approve
                </Button>]} title="Staking" open={isModalStakingOpen} onOk={handleOkStaking} onCancel={handleCancel}>
                {/* <NumberInput/> */}
            </Modal>
                <Modal title="Reward" open={isModalRewardOpen} onOk={handleOkReward} onCancel={handleCancel}>
                {/* <h1>{balance !== null ? <h1>{balance}</h1> : <p>Loading...</p>}</h1> */}
            </Modal>
            <Modal title="Balance" open={isModalBalanceOpen} onOk={handleOkBalance} onCancel={handleCancel}>
                
            </Modal>
          </div>

      )

    

}


export default StakingCards;