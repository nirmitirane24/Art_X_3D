import { analytics } from "./firebaseAnalyze"; // Import the initialized analytics instance
import { logEvent } from "firebase/analytics";

function handleButtonClick(buttonName, eventName, page_location) {
    console.log(`Button clicked: ${buttonName}`);

  if (analytics) {
    logEvent(analytics, eventName, {
      button_name: buttonName,
      page_location: page_location, 
    });
    console.log(`Button click event logged: ${eventName} for button: ${buttonName}`);
  } else {
    console.warn("Analytics not initialized, button click event not logged.");
  }
}
export default handleButtonClick;
//Function to handle button clicks and log them to Firebase Analytics
