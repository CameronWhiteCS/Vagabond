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
                    <div id="leftBar" className="bar">
                        <div>Profile Stuff</div>
                    </div>
                }
            </div>
        </>
    );
}

export default LeftBar;