import { FormikProvider } from "formik";
import {useState} from 'react';

const RightBar = (props) => {

    const [visible, setVisible] = useState(true);

    const styleBarInvisible = {
      justifyContent: 'flex-end',
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
      <div id="sidebar-right">
        <div id="hideBarRight" style={visible ? {} : styleBarInvisible} className="sidebar-top-bar">
          <button id="hideButtonRight" style={visible ? {} : styleButtonInvisible} className="visibility-button" onClick={toggleVisibility} >
            {visible ? "-" : "Explore"}
          </button>
        </div>
        {
          visible &&
          <div id="rightBar" className="bar">
            <div>Explore Stuff</div>
          </div>
        }
      </div>
    );
  }

  export default RightBar;