import logging
import os
import google.generativeai as genai
from flask import Flask, request, jsonify
from flask_cors import CORS

# Configure logging
logging.basicConfig(level=logging.DEBUG)  # Set logging level to DEBUG for more detail

app = Flask(__name__)
CORS(app)

# Gemini API Configuration (Ensure GOOGLE_API_KEY is set in your environment)
GOOGLE_API_KEY = ""  #api key takaychi ahe ("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    raise ValueError("GOOGLE_API_KEY environment variable not set.")

genai.configure(api_key=GOOGLE_API_KEY)
model = genai.GenerativeModel('gemini-pro')

# Documentation
DOCUMENTATION = """

ArtX3D: Detailed User Manual

Welcome to ArtX3D!

ArtX3D is a powerful yet user-friendly web-based 3D editor designed to empower users of all skill levels to create, manipulate, and share captivating 3D scenes. This comprehensive manual will guide you through every aspect of the application, from basic navigation to advanced features, enabling you to unlock your creative potential.

1. Getting Started

1.1. System Requirements:

Operating System: ArtX3D is platform-independent and runs on any operating system that supports a modern web browser.

Web Browser: Google Chrome (recommended), Mozilla Firefox, Apple Safari, Microsoft Edge (latest versions).

Hardware:

Processor: Intel Core i5 or equivalent.

Memory: 8 GB RAM or more.

Graphics Card: A dedicated graphics card with WebGL support is recommended for optimal performance.

Internet Connection: A stable internet connection is required for accessing and utilizing ArtX3D.

1.2. Accessing ArtX3D:

Web Access: ArtX3D is a web-based application, accessible through a modern web browser. Navigate to the application's URL (e.g., http://localhost:5005/ during local development). Bookmark the URL for easy access.

Account Creation:

On the Welcome Page, click the "Get Started" button, or click login button, then the register button to start making an account.

Fill out the registration form with your email, a secure password.

Click the "Register" button.

A successful registration will redirect you to the 3D editor interface. You will be auto-logged in.

Login:

If you already have an account, click the "Login" button on the Welcome Page.

Enter your registered email address.

Enter the secure password that you created during registration.

Click the "Login" button. A successful login will redirect you to the 3D editor interface.

2. Understanding the User Interface

The ArtX3D interface is intuitively organized into several key areas to provide a streamlined and efficient workflow.

2.1. Home Page

Sidebar: Provides the main navigation menu, profile information, and account management options.

Profile Section: Displays your profile icon and username. Click to access profile settings.

Navigation Menu:

Home: Returns to the main landing page.

My Files: Access your saved projects and assets. (Note: feature may not be implemented yet.)

Shared with Me: View projects and assets that have been shared with you by other users. (Note: feature may not be implemented yet.)

Community: (Note: feature may not be implemented yet.)

Tutorials: Access helpfull tutorials for the 3D modelling

Library: Access the object libraries provided with the app

Inbox: Recieve messages from the app and other users.

Upgrade Section: Click to upgrade your account for extra benefits. (Note: feature may not be implemented yet.)

Main Content: Presents a variety of actions, projects and tutorials

Top Bar: Displays the current open project.

Project Section: Allows you to create a new project or create a sample one.

Tutorial Section: Tutorials for helping users to get started.

2.2. Editor Container

The main editor interface is where you will create and manipulate your 3D scenes.

Toolbar:

The Toolbar is located at the top of the editor window.

It provides the primary tools for adding objects, managing the scene, and editing selected objects.

Undo: Reverses the last action performed.

Redo: Re-applies the last undone action.

Edit Mode Button: Enables/disables edit mode for selected objects. (Note: function may not be implemented yet.)

Add Shape Buttons: Provides quick access to adding basic and advanced 3D shapes.

Main Area: Divides the workspace into two key components:

Sidebar: Located on the left side of the screen.

Hierarchy Panel: Displays a hierarchical list of all objects in your scene.

Searching objects, you can search by any attribute of your 3D model.

Selecting objects for manipulating and performing actions with the properties panel.

Importing 3D models in various formats (obj, fbx, stl...)

Using 3D object library by using search filters.

Exporting models as specific formats (gltf, obj, stl...)

Properties Panel: Enables you to modify various properties of the selected objects or the scene itself.

Viewport: Located on the right side of the screen.

The 3D canvas where you visualize and interact with your 3D scene.

Provides camera controls for navigating around the scene.

Allows you to select and manipulate objects using transformation controls.

3. Core Features and How to Use Them

3.1. Toolbar: Core Actions

Undo and Redo:

To undo an action, click the "Undo" button (or use the keyboard shortcut Ctrl+Z). This will revert the scene to its previous state.

To redo an undone action, click the "Redo" button (or use the keyboard shortcut Ctrl+Y). This will reapply the previously undone action.

Note: Undo/redo functionality might have limitations.

Enabling Edit Mode:
*Select at least one model to enable Edit mode button to display.

Adding Basic Shapes:

In the "Basic Shapes" section of the Toolbar, click on the button representing the shape you want to add (e.g., "Cube," "Sphere").

The selected shape will be added to the center of the 3D viewport with default dimensions.

The new object will also appear in the Hierarchy Panel.

Adding Advanced Shapes:

Click on the "More Shapes" section to expand the list of available advanced shapes.

Click the button representing the desired shape (e.g., "Cone," "Torus," "Plane").

The selected shape will be added to the 3D viewport.

3.2. Hierarchy Panel: Scene Management

The Hierarchy Panel is your central hub for managing the objects within your scene.

Searching for Objects:

In the "Search" input field at the top of the Hierarchy Panel, enter the name or partial name of the object you are looking for.

The list of objects in the panel will be dynamically filtered to display only those that match your search term.

Selecting Objects:

Click on the name of an object in the Hierarchy Panel to select it.

You can select multiple objects by:

Holding down the Ctrl (or Cmd on macOS) key while clicking on objects to select them individually.

Holding down the Shift key while clicking on the first and last object in a range to select all objects within that range.

When an object is selected:

It will be highlighted in the 3D viewport.

Its properties will be displayed in the Properties Panel.

Deleting Objects
1.Select objects you want to delete in the hierarcy panel
2.Click on the red trash icon
3.Click delete button on modal

Importing external 3D models

Click the import button

In the prompt you select "3D Model (GLTF, OBJ, FBX, STL)" format

Selected objects are added in the scene and are ready to be used.

Notes about the model formats:

.gltf and .glb formats, it is possible to export models in 3D modelling tools.

Object Library

Click the library button

Browse through 3D objects library

To help narrow the search down you can also use search and type a name or attribute

Exporting models

Click on the export button

A list of 3D file format opens to download

Select the format you wish to export in and enjoy your model

3.3. Properties Panel: Fine-Tuning Your Scene

The Properties Panel enables you to modify a wide range of properties of the selected object.

Selecting an Object:

To modify an object's properties, select it by clicking on it in the Hierarchy Panel or the 3D viewport.

The Properties Panel will update to display the properties of the selected object.

Position, Rotation, and Scale:

Locate the "Position," "Rotation," and "Scale" sections in the Properties Panel.

Each property has three input controls corresponding to the X, Y, and Z axes:

Using Horizontal Sliders: Click and drag the small slider to change the value
Using the Number Inputs: Precisely enter a numerical value to affect the object size, position and rotation.

Material Editor:

To customize an object's appearance, click the "Material Editor" button in the Properties Panel. This will open the Material Editor.

The Material Editor provides a range of controls for modifying an object's material properties:

Color: Select a base color for the object by clicking the color swatch. This will open a color picker where you can choose a color from a visual palette or enter a hexadecimal color code.

Emissive Color: Set an emissive color to make the object appear to glow. Follow the steps from previous point, the method is the same.

Metalness: Adjust the metalness of the material using the slider. A value of 0 creates a non-metallic appearance, while a value of 1 creates a highly metallic appearance.

Roughness: Adjust the roughness of the material using the slider. A value of 0 creates a smooth, shiny surface, while a value of 1 creates a rough, matte surface.

Opacity: Adjust the opacity of the material using the slider. A value of 1 makes the object fully opaque, while lower values make it translucent or transparent.

Reflectivity: Set the level of relflectivity of the object

Shininess: Shininess determines how reflective the object's surface is

Ior: Ior specifies the index of refraction, affecting how light bends when entering the material

Transmission: Transmission is the proportion of light that passes through an object.

Clearcoat: Creates a clear coat effect

Sheen: Creates a soft velvet-like surface

Thickness: sets the thickness of the object

Sides
*Click the buttons Front, Back, Both for the 3D object.
*Front - the model displays front side material, hiding the back
*Back - the model displays back side material, hiding the front
*Both - the model displays the material for both the front and back sides

3.4. Viewport Interaction: Navigating and Transforming

The Viewport provides a visual representation of your 3D scene and allows for interactive manipulation.

Camera Controls:

The camera is controlled using the OrbitControls.

Rotate: Click and drag within the viewport to rotate the camera around the scene.

Pan: Use the middle mouse button (or Ctrl + left click and drag) to pan the camera.

Zoom: Use the scroll wheel to zoom in and out.

Keyboard : Use W,S,A,D keys to control the models.

Object Selection:

Click on an object in the Viewport to select it.

The selected object will be highlighted with a transform gizmo.

The object’s name will also be highlighted in the Hierarchy Panel.

Object Transformation (Move, Rotate, Scale):

When an object is selected, the TransformControls gizmo will appear in the Viewport.

The TransformControls provide handles for:
Translation:
* Click and drag the arrow handles on the X, Y, or Z axis to move the object along that axis.
Rotation:
* Click and drag the circular handles on the X, Y, or Z axis to rotate the object around that axis.
Scaling:
* Click and drag the box handles on the X, Y, or Z axis to scale the object along that axis.

Precision Movement

To achieve more precise transformations, use the keyboard controls while dragging the transform handles or entering specific numerical values in the property panel.
5. Troubleshooting

If some issues occur you can do these things :

Refresh the page

Try exporting the models

Try creating models in a different 3D tool

6. Best Practices

Organize Models in hierachy It is easier to modify parameters.

Optimization models to lower the memory size This way the app should run better.
"""

def ask_ai(query):
    """Constructs the prompt, sends it to Gemini, and returns the AI's response."""
    prompt = f"""You are an AI assistant for a 3D editor application.
    Use the following documentation to answer user questions. If the user
    asks a question that is not covered by the documentation, say you cannot
    answer it.Welcome to ArtX3D! ArtX3D is a powerful yet user-friendly web-based 3D editor designed to empower users of all skill levels to create, manipulate, and share captivating 3D scenes. This comprehensive manual will guide you through every aspect of the application, from basic navigation to advanced features, enabling you to unlock your creative potential. If someone greets you "Hi, hello or any type of greeting" greet him back. 

    [Documentation BEGIN]
    {DOCUMENTATION}
    [Documentation END]

    User Query: {query}
    """

    logging.debug(f"Prompt being sent to Gemini:\n{prompt}") # Log the prompt

    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        logging.exception(f"Error during Gemini API call: {e}") # Log the exception with traceback
        return "An error occurred while processing your request."


@app.route('/api/ask', methods=['POST'])
def api_ask():
    """API endpoint to receive user queries and return AI responses."""
    try:
        data = request.get_json()
        if data is None:
            logging.error("Request data is None.  Check Content-Type header.")
            return jsonify({"error": "Invalid JSON data received"}), 400

        user_query = data.get('query')

        if not user_query:
            return jsonify({"error": "Query is required"}), 400

        ai_response = ask_ai(user_query)
        return jsonify({"response": ai_response})

    except Exception as e:
        logging.exception(f"Error processing request: {e}")
        return jsonify({"error": "Internal server error"}), 500


if __name__ == '__main__':
    app.run(debug=True)  # Use debug=True during development