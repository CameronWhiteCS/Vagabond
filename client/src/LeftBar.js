import { useState } from 'react';



const LeftBar = (props) => {

    const [visible, setVisible] = useState(true)

    const styleBarInvisible = {
        justifyContent: 'flex-start',
        background: '#454545',
        marginTop: '30px'
    };

    const styleButtonInvisible = {
        fontSize: '25px',
        background: 'white'
    };

    const toggleVisibility = () => {
        setVisible(!visible);
    }

    return (
        <>
            <div id="sidebar-left">
                <div id="hideBarLeft" style={visible ? {} : styleBarInvisible} className="sidebar-top-bar">
                    <button id="hideButtonLeft" style={visible ? {} : styleButtonInvisible} className="visibility-button" onClick={toggleVisibility}>
                        {visible ? "-" : "Profile"}
                    </button>
                </div>
                {
                    visible &&
                    <div id="leftBar" className="bar" style={{display:'flex',flexDirection:'column',justifyContent:'flex-start',alignItems:'center'}}>
                        <div id="profile-pic" style={{backgroundImage:'url("https://www.treehugger.com/thmb/7g7LQAnUZcEWSThwdvIlFt2u2G0=/4560x2565/smart/filters:no_upscale()/duckling-close-up-500315849-572917c93df78ced1f0b99ec.jpg")'}}></div>
                        <h1 className="dark">lilDuckie_</h1>
                        <div id="counts-parent" style={{display:'flex',justifyContent:'space-around',width:'80%',marginTop:'10px'}}>
                            <div id="following-parent" style={{display:'flex',alignItems:'center',flexDirection:'column'}}>
                                <h1 className="dark">123</h1>
                                <div>Following</div>
                            </div>
                            <div id="followers-parent" style={{display:'flex',alignItems:'center',flexDirection:'column'}}>
                                <h1 className="dark">3443</h1>
                                <div>Followers</div>
                            </div>
                        </div>
                    </div>
                }
            </div>
        </>
    );
}

export default LeftBar;