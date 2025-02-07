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
GOOGLE_API_KEY = "AIzaSyAfjxspY7BO7MYK8PGMaj3sV4QmcJUZQBo"  #api key takaychi ahe ("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    raise ValueError("GOOGLE_API_KEY environment variable not set.")

genai.configure(api_key=GOOGLE_API_KEY)
model = genai.GenerativeModel('gemini-pro')

# Documentation
DOCUMENTATION = """
ArtX3D: Detailed User Manual - Version 1.0

Welcome to ArtX3D!

ArtX3D is a powerful and intuitive web-based 3D editor, designed to empower users of all skill levels to create, manipulate, and share captivating 3D scenes. Whether you're a seasoned professional or a complete beginner, ArtX3D provides the tools and resources you need to bring your creative visions to life. This comprehensive manual will guide you through every aspect of the application, from basic navigation to advanced features, ensuring you can unlock your full artistic potential. This manual is frequently updated, so check back often for new information.

Table of Contents:

1.  Getting Started
    1.1. System Requirements
    1.2. Accessing ArtX3D
    1.3. Account Creation and Login
    1.4. First Launch and Initial Setup

2. Understanding the User Interface
    2.1. Home Page Overview
    2.2. Editor Container Layout
    2.3. Toolbar Functions
    2.4. Hierarchy Panel Exploration
    2.5. Properties Panel Deep Dive
    2.6. Viewport Navigation and Controls

3. Core Features and How to Use Them
    3.1. Toolbar: Core Actions Explained
        3.1.1. Undo and Redo Functionality
        3.1.2. Enabling Edit Mode
        3.1.3. Adding Basic Shapes (Cube, Sphere, Cylinder, etc.)
        3.1.4. Adding Advanced Shapes (Cone, Torus, Plane, etc.)
    3.2. Hierarchy Panel: Scene Management Masterclass
        3.2.1. Searching for Objects Efficiently
        3.2.2. Selecting Objects (Single, Multiple, Range)
        3.2.3. Renaming Objects
        3.2.4. Grouping and Ungrouping Objects
        3.2.5. Deleting Objects
    3.3. Properties Panel: Fine-Tuning Your Scene Like a Pro
        3.3.1. Selecting an Object for Property Modification
        3.3.2. Position, Rotation, and Scale: Precise Transformations
            *   Using Horizontal Sliders
            *   Using Number Inputs
        3.3.3. Material Editor: Unleashing Your Artistic Vision
            *   Color Selection
            *   Emissive Color: Creating Glowing Effects
            *   Metalness: From Dull to Shiny
            *   Roughness: Controlling Surface Smoothness
            *   Opacity: Transparency and Translucency
            *   Reflectivity: Setting the reflection Level of the object
            *   Shininess: Shininess determines how reflective the object's surface is
            *   Ior: Ior specifies the index of refraction, affecting how light bends when entering the material
            *   Transmission: Transmission is the proportion of light that passes through an object.
            *   Clearcoat: Creates a clear coat effect
            *   Sheen: Creates a soft velvet-like surface
            *   Thickness: sets the thickness of the object
            *   Sides: Front, Back, Both
            *   Cast Shadow:  Determines whether the object casts a shadow onto other objects in the scene. (Boolean: true/false)
            *   Receive Shadow: Determines whether the object receives shadows cast by other objects in the scene. (Boolean: true/false)
        3.3.4 Scene Settings
            * Background color
            * Effects Enabled: Enables/disables the screen effects
            * Ambient Shadows Enabled: ambient shadows settings enable / disable
            * Ambient Intensity: Sets the ambient intensity of the ambient light in the scene
            * Light Settings
                * Light Color: Sets the color of the light
                * Light Intensity: Set the intenstity of the light
                * Light Coordinates: Light X, Light Y, Light Z
                * Light Shadows: Enables/disables the light casting shadows. Requires `castShadow` and `receiveShadow` to be enabled on objects.
                * Shadow Map Size: Sets the resolution of the shadow map. Higher values result in sharper shadows but can impact performance. Common values: 512, 1024, 2048, 4096.
                * Shadow Camera Near:  The near clipping plane of the shadow camera.  Adjust to avoid shadows being cut off close to the light source.
                * Shadow Camera Far:  The far clipping plane of the shadow camera.  Adjust to control the range of the shadow.
                * Shadow Camera Left:  The left extent of the shadow camera's view.
                * Shadow Camera Right: The right extent of the shadow camera's view.
                * Shadow Camera Top:  The top extent of the shadow camera's view.
                * Shadow Camera Bottom: The bottom extent of the shadow camera's view.
    3.4. Viewport Interaction: Navigating and Transforming in 3D Space
        3.4.1. Camera Controls: Mastering the OrbitControls
            *   Rotating the Camera
            *   Panning the Camera
            *   Zooming In and Out
            *   Keyboard camera movement
        3.4.2. Object Selection Techniques
        3.4.3. Object Transformation: Move, Rotate, Scale with Precision
            *   Using the TransformControls Gizmo
                *   Translation
                *   Rotation
                *   Scaling
            *   Precision Movement Techniques
            *   Resetting Transformations

4. Importing and Exporting
    4.1. Importing External 3D Models
        4.1.1. Supported File Formats (GLTF, OBJ, FBX, STL)
        4.1.2. Importing Process: Step-by-Step
        4.1.3. Optimizing Imported Models
    4.2. Object Library
        4.2.1. Object Library explanation
        4.2.2. Browsing the Object Library
        4.2.3. Using the object search by name and/or attribute
    4.3. Exporting Your Creations
        4.3.1. Available Export Formats (GLTF, OBJ, STL)
        4.3.2. Export Settings and Options
        4.3.3. Preparing Your Model for Export

5. Advanced Features
    5.1. Lighting and Shadows: Creating Realistic Scenes
    5.2. Materials and Textures: Adding Detail and Realism
    5.3. Special Effects (If any)
    5.4. Collaboration Features (If any)

6. Troubleshooting
    6.1. Common Issues and Solutions
    6.2. Performance Optimization Tips
    6.3. Contacting Support

7. Best Practices
    7.1. Organizing Your Scene for Efficiency
    7.2. Optimizing Models for Performance
    7.3. Saving and Backing Up Your Work

---

1. Getting Started

1.1. System Requirements:

ArtX3D is designed to run smoothly on a wide range of devices. Here are the recommended system requirements for optimal performance:

Operating System: ArtX3D is platform-independent and runs seamlessly on any operating system that supports a modern web browser (Windows, macOS, Linux, ChromeOS, Android, iOS).

Web Browser:  We recommend using the latest versions of Google Chrome, Mozilla Firefox, Apple Safari, or Microsoft Edge for the best experience.  Older browsers may experience compatibility issues or reduced performance.

Hardware:

*   Processor: Intel Core i5 or equivalent AMD processor.  For complex scenes, a more powerful processor is recommended.
*   Memory: 8 GB RAM or more.  More RAM allows for handling larger and more detailed scenes.
*   Graphics Card:  A dedicated graphics card with WebGL support is highly recommended for optimal performance and visual quality.  Integrated graphics may work, but performance may be limited.  NVIDIA GeForce GTX 960 or AMD Radeon R7 370 or better is suggested.
*   Storage: 200 MB of available storage space.
*   Internet Connection: A stable internet connection is required for accessing and utilizing ArtX3D. A broadband connection with a download speed of at least 10 Mbps is recommended.

1.2. Accessing ArtX3D:

Web Access: ArtX3D is a web-based application, meaning you can access it directly through your web browser. Simply navigate to the application's URL (e.g., http://localhost:5005/ during local development, or the live URL once deployed). For easy access, bookmark the URL in your browser.

1.3. Account Creation and Login:

Account Creation:

1.  On the Welcome Page, click the "Get Started" button, or click the "Login" button and then the "Register" button to create a new account.
2.  Fill out the registration form with your email address and a secure password.  Choose a strong password that you don't use for other accounts.
3.  Carefully review the Terms of Service and Privacy Policy before proceeding.
4.  Click the "Register" button to submit the form.
5.  A successful registration will automatically redirect you to the 3D editor interface, and you will be logged in.

Login:

1.  If you already have an account, click the "Login" button on the Welcome Page.
2.  Enter your registered email address and the password you created during registration.
3.  Click the "Login" button.
4.  A successful login will redirect you to the 3D editor interface.

1.4. First Launch and Initial Setup:

Upon your first successful login, you may be presented with a brief introductory tutorial or onboarding experience. This is a great way to familiarize yourself with the basic layout and key features of ArtX3D.  Consider exploring the example projects to get a sense of what's possible.

---

2. Understanding the User Interface

The ArtX3D interface is designed to be intuitive and efficient, providing you with all the tools you need to create stunning 3D scenes. Let's explore the key areas:

2.1. Home Page Overview:

The Home Page serves as your central hub for navigating ArtX3D and accessing various resources.

*   Sidebar:  Located on the left side of the screen, the Sidebar provides the main navigation menu, profile information, and account management options.
    *   Profile Section: Displays your profile icon and username. Click to access your profile settings, where you can update your information and manage your account.
    *   Navigation Menu:
        *   Home: Returns you to the main landing page from anywhere within the application.
        *   My Files:  (Note: This feature may not be fully implemented yet.) Access your saved projects and assets, allowing you to easily manage and organize your work.
        *   Shared with Me: (Note: This feature may not be fully implemented yet.) View projects and assets that have been shared with you by other users, facilitating collaboration and teamwork.
        *   Community: (Note: This feature may not be implemented yet.) Connect with other ArtX3D users, share your creations, and participate in discussions.
        *   Tutorials: Access helpful tutorials and learning resources to expand your knowledge and skills.
        *   Library: Access the object libraries provided with the app
        *   Inbox: Recieve messages from the app and other users.
        *   Upgrade Section: (Note: This feature may not be implemented yet.)  Upgrade your account to unlock additional features, storage space, and other benefits.
*   Main Content:  The central area of the Home Page presents a variety of actions, projects, and tutorials, providing you with quick access to the most relevant information.
    *   Project Section:  Create a new project from scratch or create a sample one.
    *   Tutorial Section:  Browse and access tutorials to help you get started and master specific features.
*   Top Bar: Displays the current open project.

2.2. Editor Container Layout:

The Editor Container is the heart of ArtX3D, where you create and manipulate your 3D scenes. It's divided into several key components:

*   Toolbar:  Located at the top of the editor window, the Toolbar provides the primary tools for adding objects, managing the scene, and editing selected objects.  We'll explore the Toolbar functions in detail in section 2.3.
*   Main Area: The workspace is divided into two key components:
    *   Sidebar: Located on the left side of the screen, it contains the Hierarchy Panel and the Properties Panel.
        *   Hierarchy Panel: Displays a hierarchical list of all objects in your scene, allowing you to easily select, organize, and manage them.  See section 2.4 for a detailed explanation.
        *   Searching objects, you can search by any attribute of your 3D model.
        *   Selecting objects for manipulating and performing actions with the properties panel.
        *   Importing 3D models in various formats (obj, fbx, stl...)
        *   Using 3D object library by using search filters.
        *   Exporting models as specific formats (gltf, obj, stl...)
        *   Properties Panel: Enables you to modify various properties of the selected objects or the scene itself. See section 2.5 for a detailed explanation.
    *   Viewport:  Located on the right side of the screen, the Viewport is the 3D canvas where you visualize and interact with your 3D scene.  See section 2.6 for information on navigation and controls.

2.3. Toolbar Functions:

The Toolbar is your primary command center for creating and managing your 3D scenes.

*   Undo: Reverses the last action performed, allowing you to easily correct mistakes or experiment with different options.
*   Redo: Re-applies the last undone action, giving you the flexibility to revert changes you've undone.
*   Edit Mode Button: Enables/disables edit mode for selected objects. (Note: This function may not be implemented yet.)
*   Add Shape Buttons:  Provides quick access to adding basic and advanced 3D shapes to your scene.
    *   Basic Shapes: Cube, Sphere, Cylinder, Plane, etc.
    *   Advanced Shapes: Cone, Torus, Pyramid, etc.

2.4. Hierarchy Panel Exploration:

The Hierarchy Panel is your central hub for managing the objects within your scene.  It provides a hierarchical view of all objects, allowing you to easily select, organize, and manipulate them.

*   Searching for Objects:  Use the "Search" input field at the top of the Hierarchy Panel to quickly locate specific objects by name. The list of objects will be dynamically filtered as you type.
*   Selecting Objects:
    *   Single Selection: Click on the name of an object in the Hierarchy Panel to select it.  The selected object will be highlighted in the 3D Viewport and its properties will be displayed in the Properties Panel.
    *   Multiple Selection:
        *   Ctrl (or Cmd on macOS) + Click: Select multiple objects individually by holding down the Ctrl or Cmd key while clicking on their names in the Hierarchy Panel.
        *   Shift + Click: Select a range of objects by holding down the Shift key while clicking on the first and last object in the desired range.  All objects between the first and last selected objects will be selected.
*   Renaming Objects: Double-click on an object's name in the Hierarchy Panel to rename it.  Descriptive names make it easier to manage complex scenes.
*   Grouping and Ungrouping Objects:  (Note:  This feature may not be fully implemented yet.) Grouping objects allows you to treat them as a single unit, making it easier to move, rotate, and scale multiple objects simultaneously.
*   Deleting Objects
    1.Select objects you want to delete in the hierarcy panel
    2.Click on the red trash icon
    3.Click delete button on modal

2.5. Properties Panel Deep Dive:

The Properties Panel allows you to fine-tune the properties of selected objects, controlling their position, rotation, scale, material, and other attributes.

*   Selecting an Object for Property Modification: To modify an object's properties, follow these steps:
    1.  Select the object you want to modify. You can select it by clicking on it directly in the 3D Viewport *or* by clicking its name in the Hierarchy Panel.
    2.  Once the object is selected, the Properties Panel will automatically update to display the adjustable properties for that object.

*   Position, Rotation, and Scale:  These properties control the object's location, orientation, and size in the 3D scene.
    1.  Locate the "Position," "Rotation," and "Scale" sections in the Properties Panel. They are usually grouped together.
    2.  Each property (Position, Rotation, Scale) has three input fields labeled "X," "Y," and "Z," corresponding to the three axes in 3D space.
    3.  To change a value, you can either:
        *   **Using Horizontal Sliders:**  Click and drag the small slider control next to the input field. Dragging the slider left or right will decrease or increase the value, respectively.
        *   **Using Number Inputs:** Click directly into the number input field and type in a new numerical value. Press "Enter" to confirm the change.  You can also use the up and down arrow keys to increment or decrement the value.

*   Material Editor:  The Material Editor allows you to customize the visual appearance of an object, including its color, texture, and surface properties.

    1.  **Accessing the Material Editor:** Select the object you want to modify. Then, in the Properties Panel, click the "Material Editor" button.  This will open the Material Editor interface.
    2.  **Adjusting Material Properties:** The Material Editor typically provides the following controls:

        *   **Color:**
            1.  Click the color swatch (the small colored square) next to the "Color" label. This will open a color picker.
            2.  In the color picker, you can:
                *   Choose a color from the visual palette.
                *   Enter a hexadecimal color code (e.g., #FF0000 for red) in the designated input field.
            3.  Click outside the color picker to close it and apply the selected color.
        *   **Emissive Color:** (For creating glowing effects) The steps are the same as for setting the base "Color". Set the intensity to make it glow more or less
        *   **Metalness:**  Adjust the metalness of the material using the slider. Drag the slider to the left for a non-metallic (plastic-like) appearance, or to the right for a metallic (shiny) appearance. A value of 0 is non-metallic, and a value of 1 is fully metallic.
        *   **Roughness:** Adjust the roughness of the material using the slider.  Drag the slider to the left for a smooth, shiny surface (like glass or polished metal), or to the right for a rough, matte surface (like stone or fabric). A value of 0 is perfectly smooth, and a value of 1 is fully rough.
        *   **Opacity:** Adjust the opacity of the material using the slider. Drag the slider to the left to make the object more transparent, or to the right to make it more opaque. A value of 1 is fully opaque, and a value of 0 is fully transparent.
        *   **Cast Shadow:**  Determines whether the object casts a shadow onto other objects in the scene. To enable shadow casting:
            1.  Locate the "Cast Shadow" checkbox in the Properties Panel (usually within the Material or Rendering section).
            2.  Click the checkbox to enable (or disable) shadow casting for the selected object. Keep in mind that to see shadows, you also need to have a light source in your scene that is configured to cast shadows (see "Scene Settings" below).
        *   **Receive Shadow:** Determines whether the object receives shadows cast by other objects in the scene. To enable shadow receiving:
            1.  Locate the "Receive Shadow" checkbox in the Properties Panel (usually within the Material or Rendering section).
            2.  Click the checkbox to enable (or disable) shadow receiving for the selected object.

* 3.3.4 Scene Settings

Accessing Scene Settings: There is a "Scene" option in the hierachy panel and, you can change the scene settings by selecting it

    *   **Background Color:**  To change the background color of the scene:
        1.Select the scene options to open its properties.
        2.  Locate the "Background Color" control. This will usually be a color swatch (a small colored square).
        3.  Click the color swatch to open a color picker.
        4.  Choose a color from the palette, enter a hexadecimal color code, or use the color sliders to select the desired background color.
        5.  The scene background will update automatically with the selected color.

    *   **Light Shadows:**  To enable or disable shadows in the scene, and to adjust the shadow settings:

        1.  Ensure you have a light source in your scene (e.g., a Point Light or Directional Light).
        2.  Select the light source, or the scene in the hierarcy panel to open the light controls.
        3.  Locate the "Light Shadows" checkbox.
        4.  Click the "Light Shadows" checkbox to enable shadow casting for the light.
        5.  Adjust Shadow Map Size:
                1.In scene settings locate "shadow Map Size " selector.
                2.Select "shadow Map Size " to adjust shadow quality.
                3. A lower map size means a faster app.

        6.  Adjust Shadow Camera Near/Far/Left/Right/Top/Bottom
                1.In scene settings locate  "shadow Camera Near/Far/Left/Right/Top/Bottom" selector.
                2.Select "shadow Camera Near/Far/Left/Right/Top/Bottom " to adjust how the shadow is rendered.

    *   **Ambient Shadows:**  To enable or disable ambient shadows in the scene, and to adjust the ambient shadows:

        1.  Locate the "Ambient Shadows" checkbox.
        2.  Click the "Ambient Shadows" checkbox to enable ambient casting.
        3.  Set the intensity of the ambient shadows, between 0 to 100.
        4.  Use a lower number for optimization.

2.6. Viewport Interaction: Navigating and Transforming

The Viewport provides a visual representation of your 3D scene and allows for interactive manipulation.

*   Camera Controls: The camera is controlled using the OrbitControls.
    *   Rotate: Click and drag within the viewport to rotate the camera around the scene.
    *   Pan: Use the middle mouse button (or Ctrl + left click and drag) to pan the camera.
    *   Zoom: Use the scroll wheel to zoom in and out.
    *   Keyboard : Use W,S,A,D keys to control the models.
*   Object Selection: Click on an object in the Viewport to select it. The selected object will be highlighted with a transform gizmo. The object’s name will also be highlighted in the Hierarchy Panel.
*   Object Transformation (Move, Rotate, Scale): When an object is selected, the TransformControls gizmo will appear in the Viewport.
    *   Translation: Click and drag the arrow handles on the X, Y, or Z axis to move the object along that axis.
    *   Rotation: Click and drag the circular handles on the X, Y, or Z axis to rotate the object around that axis.
    *   Scaling: Click and drag the box handles on the X, Y, or Z axis to scale the object along that axis.

---

3. Core Features and How to Use Them

This section provides a detailed guide on how to use the core features of ArtX3D to create and manipulate 3D scenes.

3.1. Toolbar: Core Actions Explained

3.1.1. Undo and Redo Functionality:

*   To undo an action, click the "Undo" button (or use the keyboard shortcut Ctrl+Z). This will revert the scene to its previous state.
*   To redo an undone action, click the "Redo" button (or use the keyboard shortcut Ctrl+Y). This will reapply the previously undone action.
    *Note: Undo/redo functionality might have limitations.*

3.1.2. Enabling Edit Mode:

*Select at least one model to enable Edit mode button to display.*

3.1.3. Adding Basic Shapes:

*   In the "Basic Shapes" section of the Toolbar, click on the button representing the shape you want to add (e.g., "Cube," "Sphere").
*   The selected shape will be added to the center of the 3D viewport with default dimensions.
*   The new object will also appear in the Hierarchy Panel.

3.1.4. Adding Advanced Shapes:

*   Click on the "More Shapes" section to expand the list of available advanced shapes.
*   Click the button representing the desired shape (e.g., "Cone," "Torus," "Plane").
*   The selected shape will be added to the 3D viewport.

3.2. Hierarchy Panel: Scene Management Masterclass

3.2.1. Searching for Objects Efficiently:

*   In the "Search" input field at the top of the Hierarchy Panel, enter the name or partial name of the object you are looking for.
*   The list of objects in the panel will be dynamically filtered to display only those that match your search term.

3.2.2. Selecting Objects:

*   Click on the name of an object in the Hierarchy Panel to select it.
*   You can select multiple objects by:
    *   Holding down the Ctrl (or Cmd on macOS) key while clicking on objects to select them individually.
    *   Holding down the Shift key while clicking on the first and last object in a range to select all objects within that range.
*   When an object is selected:
    *   It will be highlighted in the 3D viewport.
    *   Its properties will be displayed in the Properties Panel.

3.2.5. Deleting Objects
    1.Select objects you want to delete in the hierarcy panel
    2.Click on the red trash icon
    3.Click delete button on modal

3.3. Properties Panel: Fine-Tuning Your Scene Like a Pro

3.3.1. Selecting an Object:

*   To modify an object's properties, select it by clicking on it in the Hierarchy Panel or the 3D viewport.
*   The Properties Panel will update to display the properties of the selected object.

3.3.2. Position, Rotation, and Scale:

*   Locate the "Position," "Rotation," and "Scale" sections in the Properties Panel.
*   Each property has three input controls corresponding to the X, Y, and Z axes:
    *   Using Horizontal Sliders: Click and drag the small slider to change the value
    *   Using the Number Inputs: Precisely enter a numerical value to affect the object size, position and rotation.

3.3.3. Material Editor:

*   To customize an object's appearance, click the "Material Editor" button in the Properties Panel. This will open the Material Editor.
*   The Material Editor provides a range of controls for modifying an object's material properties:
    *   Color: Select a base color for the object by clicking the color swatch. This will open a color picker where you can choose a color from a visual palette or enter a hexadecimal color code.
    *   Emissive Color: Set an emissive color to make the object appear to glow. Follow the steps from previous point, the method is the same.
    *   Metalness: Adjust the metalness of the material using the slider. A value of 0 creates a non-metallic appearance, while a value of 1 creates a highly metallic appearance.
    *   Roughness: Adjust the roughness of the material using the slider. A value of 0 creates a smooth, shiny surface, while a value of 1 creates a rough, matte surface.
    *   Opacity: Adjust the opacity of the material using the slider. A value of 1 makes the object fully opaque, while lower values make it translucent or transparent.
    *   Cast Shadow:  Determines whether the object casts a shadow onto other objects in the scene. Enable this to make the object project shadows.
    *   Receive Shadow: Determines whether the object receives shadows cast by other objects in the scene. Enable this to make the object display shadows.

3.4. Viewport Interaction: Navigating and Transforming

The Viewport provides a visual representation of your 3D scene and allows for interactive manipulation.

*   Camera Controls: The camera is controlled using the OrbitControls.
    *   Rotate: Click and drag within the viewport to rotate the camera around the scene.
    *   Pan: Use the middle mouse button (or Ctrl + left click and drag) to pan the camera.
    *   Zoom: Use the scroll wheel to zoom in and out.
    *   Keyboard : Use W,S,A,D keys to control the models.
*   Object Selection: Click on an object in the Viewport to select it. The selected object will be highlighted with a transform gizmo. The object’s name will also be highlighted in the Hierarchy Panel.
*   Object Transformation (Move, Rotate, Scale): When an object is selected, the TransformControls gizmo will appear in the Viewport.
    *   Translation: Click and drag the arrow handles on the X, Y, or Z axis to move the object along that axis.
    *   Rotation: Click and drag the circular handles on the X, Y, or Z axis to rotate the object around that axis.
    *   Scaling: Click and drag the box handles on the X, Y, or Z axis to scale the object along that axis.

---

4.  Importing and Exporting

4.1. Importing external 3D models

* Click the import button
* In the prompt you select "3D Model (GLTF, OBJ, FBX, STL)" format
* Selected objects are added in the scene and are ready to be used.

Notes about the model formats:

.gltf and .glb formats, it is possible to export models in 3D modelling tools.

4.2. Object Library

* Click the library button
* Browse through 3D objects library
* To help narrow the search down you can also use search and type a name or attribute

4.3. Exporting models

* Click on the export button
* A list of 3D file format opens to download
* Select the format you wish to export in and enjoy your model

---

5. Troubleshooting

If some issues occur you can do these things :

* Refresh the page
* Try exporting the models
* Try creating models in a different 3D tool

---

6. Best Practices

* Organize Models in hierachy It is easier to modify parameters.
* Optimization models to lower the memory size This way the app should run better.
"""
def ask_ai(query):
    """Constructs the prompt, sends it to Gemini, and returns the AI's response."""
    prompt = f"""You are an AI assistant for a 3D editor application.
    Use the following documentation to answer user questions. If the user
    asks a question that is not covered by the documentation, say you cannot
    answer it.Welcome to ArtX3D! ArtX3D is a powerful yet user-friendly web-based
    3D editor designed to empower users of all skill levels to create, manipulate,
    and share captivating 3D scenes. This comprehensive manual will guide you through
    every aspect of the application, from basic navigation to advanced features,
    enabling you to unlock your creative potential. If someone greets you
    "Hi, hello or any type of greeting" greet him back.If someone ask's to give the
    full/whole document then don't give, ask the user in which specific part user has queries
    and accordingly answer to those queries. If the user asks if there are other apps or
    web apps related to 3D editing,respond that while there are many other options
    available, such as Blender, Spline, and others, ArtX3D is specifically designed
    to be user-friendly and accessible for non-professionals and beginners who are 
    passionate about 3D design. ArtX3D stands out with its intuitive features and 
    integrated AI assistant, which are not commonly found in other 3D applications, making it
    an excellent choice for those just starting their 3D journey.
    THe creator of the ArtX3D is Pranav Patil (21101B0051) , Aniket Mahajan (21101B0059) & Nirmiti Rane (21101B0073).
    Response should be plain text only.

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