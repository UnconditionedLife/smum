import React, { Component } from 'react';
import moment from 'moment';

class Homepage extends Component {
  render() {
    return (
      <div className="main-div">
        <div id="clientsDiv">
          <div className="contentHeader">
            <div id="clientsTitle" className="contentTitle">{moment().format("dddd, MMM DD YYYY")}</div>
            <div className="sectionName">Clients</div>
          </div>
          <div className="container" style={{backgroundColor: 'white'}}>
            <input id="tab1" className="tabInput" type="radio" name="tabs" defaultChecked />
            <label id="tabLable1" htmlFor="tab1" onload="fillDate()"><i className="fa"></i>Found</label>
            <input id="tab2" className="tabInput" type="radio" name="tabs" />
            <label id="tabLable2" htmlFor="tab2"><i className="fa"></i>Services</label>
            <input id="tab3" className="tabInput" type="radio" name="tabs" />
            <label id="tabLable3" htmlFor="tab3"><i className="far"></i>Client</label>
            <input id="tab4" className="tabInput" type="radio" name="tabs" />
            <label id="tabLable4" htmlFor="tab4"><i className="fa"></i>Dependents</label>
            <input id="tab5" className="tabInput" type="radio" name="tabs" />
            <label id="tabLable5" htmlFor="tab5" onclick="dbLoadServiceHistory()"><i className="fas"></i>History</label>
            <input id="tab6" className="tabInput" type="radio" name="tabs" />
            <label id="tabLable6" htmlFor="tab6"><i className="far"></i>Notes</label>
            <input id="tab7" className="tabInput" type="radio" name="tabs" />
            <label id="tabLable7" htmlFor="tab7"><i className="fa"></i>Today</label>
            <section id="content1">
              {/* Found */}
              <container id="searchContainer" />
            </section>
            <section id="content2">
              {/* Services */}
              <container id="serviceButtonContainer">
                <div id="serviceDateTime" />
                <div id="serviceLastVisit" />
                <div id="servicePrimaryButtons">
                  <div className="bannerDiv"><span className="bannerText">SEARCH FOR A CLIENT</span></div>
                </div>
                <div id="serviceSecondaryButtons" />
              </container>
            </section>
            <section id="content3">
              {/* Client */}
              <div className="topFormButtonsDiv">
                <input id="newClientButton" className="solidButton viewOnly" onclick="clickShowNewClientForm()" type="button" defaultValue="New Client" />
                <input id="clientLeftSlider" className="leftSlider sliderActive" onclick="clickToggleClientViewEdit('view')" type="button" defaultValue="View" />
                <input id="clientRightSlider" className="rightSlider" onclick="clickToggleClientViewEdit('edit')" type="button" defaultValue="Edit" />
              </div>
              <div id="clientFormWrap">
                <container id="clientFormContainer" />
              </div>
            </section>
            <section id="content4">
              {/* Dependents */}
              <div className="topFormButtonsDiv">
                <input id="newDependentButton" className="solidButton dependentsEditOnly" onclick="uiAddNewDependentsRow()" type="button" defaultValue="New Dependent" />
                <input id="dependentdLeftSlider" className="leftSlider sliderActive" onclick="clickToggleDependentsViewEdit('view')" type="button" defaultValue="View" />
                <input id="dependentdRightSlider" className="rightSlider" onclick="clickToggleDependentsViewEdit('edit')" type="button" defaultValue="Edit" />
              </div>
              <container id="dependentsFormContainer" />
              <div className="dependentsEditOnly" style={{display: 'flex', justifyContent: 'center', height: '60px', alignItems: 'center'}}>
                <input id="dependentsSaveButton" className="solidButton" onclick="clickSaveDependentsTable()" type="button" defaultValue="Save" />
                <input className="openButton" onclick="clickResetDependentsTable()" type="button" defaultValue="Cancel" />
              </div>
            </section>
            <section id="content5">
              {/* History */}
              <div id="historyTop">
                <div className="bannerDiv"><span className="bannerText">SEARCH FOR CLIENT</span></div>
              </div>
              <div id="historyBottom" />
            </section>
            <section id="content6">
              {/* Notes */}
              <div id="newNoteButton" className="topFormButtonsDiv"><input className="solidButton" onclick="clickToggleNoteForm('show','')" type="button" defaultValue="New Note" /></div>
              <div id="noteEditForm">
                <div id="noteEditHeader">NEW NOTE</div>
                <div><textarea id="noteTextArea" className="noteForm" required defaultValue={""} /></div>
                <div style={{padding: '12px'}}><input id="noteIsImportant" className="noteForm" type="checkbox" defaultValue="true" /> <span className="checkboxtext">&nbsp; IMPORTANT!</span></div>
                <div style={{paddingTop: '8px'}}>
                  <p><input className="solidButton" onclick="clickSaveNote()" type="button" defaultValue="Save" /></p>
                </div>
                <div style={{paddingTop: '8px'}}><input className="openButton" onclick="clickToggleNoteForm('hide', '')" type="button" defaultValue="Cancel" /></div>
              </div>
              <container id="notesContainer" />
            </section>
            <section id="content7">
              {/* Today */}
              <container id="todayContainer">
                <div id="todayBodyDiv" />
              </container>
            </section>
          </div>
        </div>
        <div id="adminDiv">
          <div className="contentHeader">
            <div id="adminTitle" className="contentTitle" />
            <div className="sectionName">Admin</div>
          </div>
          <div className="container" style={{backgroundColor: 'white'}}>
            <input id="aTab1" className="tabInput" type="radio" name="tabs" defaultChecked />
            <label id="atabLable1" htmlFor="aTab1" onload="fillDate()">Services</label>
            <input id="aTab2" className="tabInput" type="radio" name="tabs" />
            <label id="atabLable2" htmlFor="aTab2">Service Type</label>
            <input id="aTab3" className="tabInput" type="radio" name="tabs" />
            <label id="atabLable3" htmlFor="aTab3">Reports</label>
            <input id="aTab4" className="tabInput" type="radio" name="tabs" />
            <label id="atabLable4" htmlFor="aTab4">Users</label>
            <input id="aTab5" className="tabInput" type="radio" name="tabs" />
            <label id="atabLable5" htmlFor="aTab5">User</label>
            <input id="aTab6" className="tabInput" type="radio" name="tabs" />
            <label id="atabLable6" htmlFor="aTab6">Settings</label>
            <input id="aTab7" className="tabInput" type="radio" name="tabs" />
            <label id="atabLable7" htmlFor="aTab7">Import</label>
            <section id="aContent1">
              {/* Services Section */}
              <div className="topFormButtonsDiv">
                <input className="solidButton" onclick="uiShowNewServiceTypeForm()" type="button" defaultValue="New Service Type" />
              </div>
              <container id="serviceTypesContainer" />
            </section>
            <section id="aContent2">
              {/*  ServiceTypes Section */}
              <div className="topFormButtonsDiv">
                <input className="solidButton" onclick="uiShowNewServiceTypeForm()" type="button" defaultValue="New Service Type" />
              </div>
              <container id="serviceTypeFormContainer" />
            </section>
            <section id="aContent3">
              {/*  Reports Section */}
              <container id="reportsFormContainer" />
            </section>
            <section id="aContent4">
              {/*  Users Section */}
              <div className="topFormButtonsDiv">
                <input className="solidButton" onclick="uiShowNewUserForm()" type="button" defaultValue="New User" />
              </div>
              <container id="userListContainer" />
            </section>
            <section id="aContent5">
              {/*  User Section */}
              <div className="topFormButtonsDiv">
                <input className="solidButton" onclick="uiShowNewUserForm()" type="button" defaultValue="New User" />
              </div>
              <container id="userFormContainer" />
            </section>
            <section id="aContent6">
              {/*  Settings Section */}
              <container id="settingsFormContainer" />
            </section>
            <section id="aContent7">
              {/*  Import Section */}
              {/* <div id="name">
                  <h3>Given Names</h3>
               </div>
               <div id="name">
                  <input type="button" onClick="getGivenNames('clients.json')" value="Names from Clients">
                  <input type="button" onClick="getGivenNames('dependents.json')" value="Names from Dependents">
                  <input type="button" onClick="showNames()" value="Show Names & Store">
               </div> */}
              <div style={{marginLeft: '50px'}}>
                <table>
                  <tbody><tr>
                      <td>
                        <h3>Client Import</h3>
                      </td>
                      <td>
                        <input className="openButton" type="button" onclick="removeEmptyClientRecords()" defaultValue="Remove Empties" />
                      </td>
                      <td>
                        <input className="openButton" type="button" onclick="importClients(0, 100)" defaultValue="(1)Import Clients" />
                      </td>
                      <td>
                        &nbsp;
                      </td>
                    </tr>
                    <tr>
                      <td>
                        &nbsp;
                      </td>
                      <td style={{textAlign: 'center'}}>
                        <span id="cleanCount">...</span>
                      </td>
                      <td style={{textAlign: 'center'}}>
                        <span id="clientCount">...</span>
                      </td>
                      <td>
                        &nbsp;
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <h3>Dependents Import into Clients</h3>
                      </td>
                      <td>
                        <input className="openButton" type="button" onclick="loadDependents()" defaultValue="(2)Load Dep JSON" />
                      </td>
                      <td>
                        <input className="openButton" type="button" onclick="importDependents(0, 100)" defaultValue="(3)Import Dependents" />
                      </td>
                      <td>
                        &nbsp;
                      </td>
                    </tr>
                    <tr>
                      <td>
                        &nbsp;
                      </td>
                      <td style={{textAlign: 'center'}}>
                        <span id="dependentsLoaded">...</span>
                      </td>
                      <td style={{textAlign: 'center'}}>
                        <span id="dependentsImported">...</span>
                      </td>
                      <td>
                        &nbsp;
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <h3>Last Served Food Import into Clients</h3>
                      </td>
                      <td>
                        &nbsp;
                      </td>
                      <td>
                        <input className="openButton" type="button" onclick="importFoodLastServed(0, 100)" defaultValue="(4)Import LastServed" />
                      </td>
                      <td>
                        &nbsp;
                      </td>
                    </tr>
                    <tr>
                      <td>
                        &nbsp;
                      </td>
                      <td>
                        &nbsp;
                      </td>
                      <td style={{textAlign: 'center'}}>
                        <span id="foodImported">...</span>
                      </td>
                      <td>
                        &nbsp;
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <h3>Upload Clients to DynamoDB</h3>
                      </td>
                      <td>
                        <input id="clientUploadStart" className="inputBox" type="text" placeholder="Start Record" defaultValue />
                      </td>
                      <td>
                        <input id="clientUploadEnd" className="inputBox" type="text" placeholder="End Record" defaultValue />
                      </td>
                      <td>
                        <input className="solidButton" type="button" onclick="uploadToDynamoDB()" defaultValue="(5)Upload To DB" />
                      </td>
                    </tr>
                    <tr>
                      <td>
                        &nbsp;
                      </td>
                      <td>
                        &nbsp;
                      </td>
                      <td>
                        &nbsp;
                      </td>
                      <td>
                        <span id="clientsUploaded">...</span>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <h3>Services/Food Import into Services</h3>
                      </td>
                      <td>
                        <input className="openButton" type="button" onclick="loadServices()" defaultValue="(1)Load Services" />
                      </td>
                      <td>
                        <input className="openButton" type="button" onclick="loadFoodServices()" defaultValue="(2)Load Food Services" />
                      </td>
                      <td>
                        {/* <input class="solidButton" type="button" onClick="uploadServicesToDynamoDB()" value="(2)Import Services"> */}
                      </td>
                    </tr>
                    <tr>
                      <td>
                        &nbsp;
                      </td>
                      <td style={{textAlign: 'center'}}>
                        <span id="servicesCount">...</span>
                      </td>
                      <td style={{textAlign: 'center'}}>
                        <span id="servicesFoodCount">...</span>
                      </td>
                      <td>
                        &nbsp;
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <h3>Upload Services/Food into DynamoDB</h3>
                      </td>
                      <td>
                        <input id="servicesUploadStart" className="inputBox" type="text" placeholder="Start Record" defaultValue />
                      </td>
                      <td>
                        <input id="servicesUploadEnd" className="inputBox" type="text" placeholder="End Record" defaultValue />
                      </td>
                      <td>
                        <input className="solidButton" type="button" onclick="uploadServicesToDynamoDB()" defaultValue="(3)Upload To DB" />
                      </td>
                    </tr>
                    <tr>
                      <td>
                        &nbsp;
                      </td>
                      <td>
                        &nbsp;
                      </td>
                      <td>
                        &nbsp;
                      </td>
                      <td style={{textAlign: 'center'}}>
                        <span id="servicesUploaded">...</span>
                      </td>
                    </tr>
                  </tbody></table>
              </div>
              {/* <input type="button" onClick="importDependents(101, 1000)" value="Import [1500 Clients]">
                  <input type="button" onClick="importDependents(1001, 2000)" value="Import [3000 Clients]">
                  <input type="button" onClick="importDependents(2001, "end")" value="Import [Remaining Clients]"> */}
            </section>
          </div>
        </div>
        <div id="userDiv">
          <div className="contentHeader">
            <div id="userTitle" className="contentTitle" />
            <div className="sectionName">User</div>
          </div>
          <div className="container" style={{backgroundColor: 'white'}}>
            <input id="uTab1" className="tabInput" type="radio" name="tabs" defaultChecked />
            <label id="tabLable1" htmlFor="uTab1">User Profile</label>
            <input id="uTab2" className="tabInput" type="radio" name="tabs" />
            <label id="tabLable2" htmlFor="uTab2">New Password</label>
            {/* <input id="uTab3" class="tabInput" type="radio" name="tabs">
            <label id="tabLable3" for="uTab3">Reports</label>

            <input id="uTab4" class="tabInput" type="radio" name="tabs">
            <label id="atabLable4" for="uTab4">Users</label>

            <input id="uTab5" class="tabInput" type="radio" name="tabs">
            <label id="tabLable5" for="uTab5">Configure</label> */}
            <section id="uContent1">
              <container id="profileFormContainer" />
            </section>
            <section id="uContent2">
              <container id="userPasswordFormContainer" />
            </section>
            {/* <section id="uContent3">

            </section>
            <section id="uContent4">
            </section>
            <section id="uContent5"></section> */}
          </div>
        </div>
      </div>
    );
  }
}
export default Homepage;
