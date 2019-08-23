import React, { Component } from 'react';
import {DigitTextField, DigitTextArea, DigitButton, DigitSwitch, DigitLayout, DigitText, DigitToastActions} from '@cthit/react-digit-components'
import './Prompt.css';
import { addSuggestion, updateSuggestions } from '../../../services/data.service';
import { connect } from 'react-redux';
class PromptView extends Component{

  constructor(props){
    super(props);
    this.state = {
      title: "",
      description: "",
      author: "",
      anonymus_author: false,
      title_isempty: false,
      title_error_message: "Titeln är ej ifylld!",
      description_isempty: false,
      description_error_message: "Du måste lägga in en förklaring",
      toastOpen: this.props['toastOpen']
    }
  }

  sendNewSuggestion(){
    addSuggestion({
      title: this.state.title,
      text: this.state.description,
      author: ((this.state.author === "" || this.state.anonymus_author)? "Anonym": this.state.author)
    }).then(res => {
      updateSuggestions();
      this.setState({
        title: "",
        description: "",
        author: ""
      });
      this.state.toastOpen({
        text: "Tack så mycket! Förslaget har skickats till P.R.I.T.",
        duration: 5000
    });
    });
  }

  render() {
    return(
      <div className="prompt">
        
        <div className="innerPrompt">
          <DigitText.Heading6 text="Nytt förslag"/>
          <DigitTextField
            error={this.state.title_isempty}
            errorMessage = {this.state.title_error_message}
            onChange={e => {
                this.setState({
                    title: e.target.value
                });
            }}
            value={this.state.title}
            upperLabel="Rubrik"
            />
          <DigitTextArea
            error={this.state.description_isempty}
            errorMessage = {this.state.description_error_message}
            onChange={e => {
                this.setState({
                    description: e.target.value
                });
            }}
            value={this.state.description}
            upperLabel="Förslag"
            rows={5}
            rowsMax={10}
            />
          <DigitLayout.Row>
            <DigitTextField
              onChange={e => {
                  this.setState({
                      author: e.target.value
                  });
              }}
              value={this.state.author}
              disabled={this.state.anonymus_author}
              upperLabel="CID"
              />

            <DigitSwitch 
              value={this.state.anonymus_author}
              label="Anonym"
              primary
              onChange = {e => {
                  this.setState({
                      anonymus_author: e.target.checked
                  })
              }}
              />
                
          </DigitLayout.Row>
          <DigitButton
            text = "Skicka"
            primary
            raised
            onClick={() =>{
              this.setState({
                  title_isempty: this.state.title === "",
                  description_isempty: this.state.description === ""
              });

              if(this.state.title === "" || this.state.description === ""){
                  return;
              }
              this.sendNewSuggestion();
              }}
              />
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => ({});

const mapDispatchToProps = dispatch => ({
    toastOpen: toastData =>
        dispatch(DigitToastActions.digitToastOpen(toastData))
});

export const Prompt = connect(
    mapStateToProps,
    mapDispatchToProps
)(PromptView);

export default Prompt;