import { useEffect } from "react";
import { connect } from "react-redux";
import Moment from "react-moment";
import { getMessages } from "../actions/instructor";
import MessageBox from "./MessageBox/MessageBox";

function Messages({ getMessages, data }) {
  useEffect(() => {
    getMessages();
  }, []);

  return (
    <div className="content-wrapper">
      <div className="page-header">
        <h3 className="page-title">
          <span className="page-title-icon bg-gradient-primary text-white me-2">
            <i className="mdi mdi-account-multiple"></i>
          </span>
          Messages
        </h3>
      </div>
      <div className="card">
        <div className="card-body">
          {/* <h4 className="card-title">Members</h4> */}
          {data ? (
                  <>
                    {console.log(data)}
                    {data.map((data) => {
                      return (
                        
                        <>
                          <MessageBox
                          name={data.sender}
                          profilePicture="https://res.cloudinary.com/fituscloud/image/upload/v1666507433/FitUS_Avatar/IMG_8362_nocypy.jpg"
                          date={data.date}
                          message={data.msgBody}
                          time={data.time}
                          position="left"
                          />

                          
                        </>
                      );
                    })}
                  </>
                ) : (
                  <></>
                )}
        </div>
      </div>

      
    </div>
    


  );
}
const mapStateToProps = (state) => ({
  data: state.instructor.messages,
});

export default connect(mapStateToProps, { getMessages })(Messages);
