const DEFAULT_SETTINGS = {
  enabled: true,
  enableHighlighting: false,
  highlightColor: "yellow",
};

function loadSettings() {
  return;
}

function checkForElements(element) {
  //Checks to see if an element contains a link, or image
  //If it does, then it returns false
  //If it doesn't, then it returns true
  if (element.getElementsByTagName("a").length > 0) {
    return false;
  }
  if (element.getElementsByTagName("img").length > 0) {
    return false;
  }
  return true;
}

function boldFirstHalfOfWords(element, settings) {
  //Log if settings is undefined

  const highlightTag = false ? "mark" : "b";
  let ret = "";
  // Loop through all child nodes of the element
  for (let i = 0; i < element.childNodes.length; i++) {
    const childNode = element.childNodes[i];
    // If the node is a text node, process its content
    if (childNode.nodeType === Node.TEXT_NODE) {
      //If the element is just a space, skip it
      if (childNode.textContent === " ") {
        continue;
      }
      //If it's an empty string, skip it
      if (childNode.textContent === "") {
        continue;
      }

      if (childNode === undefined) {
        continue;
      }

      //If the text content is undefined, skip it
      if (childNode.textContent === undefined) {
        continue;
      }
      //Print the node

      const words = childNode.textContent.split(/(\s+)/);
      // Loop through all the words in the text node
      for (let j = 0; j < words.length; j++) {
        const word = words[j];
        // Check if the word is a link or image element
        if (/\b(?:a|img)\b/i.test(word)) {
          // If it is, skip this word
          continue;
        }
        //If the word is just a space skip it
        if (word === " ") {
          continue;
        }

        const length = Math.ceil(word.length / 2);

        if (length === 0) {
          continue;
        }

        const firstHalf = word.slice(0, length);
        const secondHalf = word.slice(length);

        ret = `<${highlightTag}>${firstHalf}</${highlightTag}>${secondHalf}`;

        //If the length of the word is 3 then just bold the first letter
        if (word.length === 3) {
          ret = `<${highlightTag}>${word[0]}</${highlightTag}>${word.slice(1)}`;
        }

        // Replace the original word with the bolded word in the text content
        words[j] = ret;
      }
      // Join the modified words back into a single string
      const newTextNode = document.createElement("span");
      newTextNode.innerHTML = words.join("");

      // Replace the original text node with the new element
      element.replaceChild(newTextNode, childNode);
    } else if (childNode.nodeType === Node.ELEMENT_NODE) {
      // If the node is an element node, recursively process its children
      boldFirstHalfOfWords(childNode);
    }
  }
}

function highlightFirstSyllable() {
  // Select all <p> elements on the page
  const paragraphs = document.getElementsByTagName("p");
  //List elements
  const lists = document.getElementsByTagName("li");
  //Spans
  const spans = document.getElementsByTagName("span");

  //Add elements to alltext
  const allText = [...paragraphs, ...lists, ...spans].filter((element) => {
    return element.offsetParent !== null;
  });

  console.log(allText.length);
  //Filter out any elements that aren't visible

  console.log(allText.length);

  let settings = DEFAULT_SETTINGS;

  chrome.storage.local.get(DEFAULT_SETTINGS, function (s) {
    //Set the checkbox to the correct value
    console.log(s);
    settings.enabled = s.enabled;
    settings.enableHighlighting = s.enableHighlighting;
    settings.highlightColor = s.highlightColor;

    console.log("AHHHH");
    console.log(settings.enabled);
    console.log("AHHHH");

    if (!settings.enabled) {
      return;
    }

    //Spans
    const spans = document.getElementsByTagName("span");

    //Concate the two arrays

    // Use mark or b
    const highlightTag = settings.enableHighlighting ? "mark" : "b";

    // Mark color
    const highlightColor = settings.highlightColor;

    // Iterate over each <p> element
    for (const text of allText) {
      boldFirstHalfOfWords(text, settings);
    }
    const boldElements = document.getElementsByTagName("b");
    for (let i = 0; i < boldElements.length; i++) {
      boldElements[i].style.fontWeight = "700";
    }
    return;
    const words = childNode.textContent.split(/(\s+)/);
    // Highlight the first syllable of each word
    const halfWords = words.map((word) => {
      if (word === null) {
        return null;
      }

      const length = Math.ceil(word.length / 2);

      if (length === 0) {
        return word;
      }

      const firstHalf = word.slice(0, length);
      const secondHalf = word.slice(length);

      let ret = `<${highlightTag}>${firstHalf}</${highlightTag}>${secondHalf}`;

      //If the length of the word is 3 then just bold the first letter
      if (word.length === 3) {
        ret = `<${highlightTag}>${word[0]}</${highlightTag}>${word.slice(1)}`;
      }

      return ret;
    });

    const syllableWords = words.map((word) => {
      const firstVowelIndex = word.match(
        /([aeiouyAEIOUY]+[^e.\s])|([aiouyAEIOUY]+\b)|(\b[^aeiouy0-9.']+e\b)/gi
      );
      if (firstVowelIndex === null || firstVowelIndex === -1) {
        return word;
      }
      if (firstVowelIndex.length > 0) {
        //Get everything up to the end of the first two syllables
        let firstPart = word.slice(0, firstVowelIndex[0].length);

        //See if the last letter of the first part is a vowel
        const lastLetter = firstPart.match(/[aeiouyAEIOUY]$/gi);

        let restOfWord = word.slice(firstPart.length);

        //If the last letter is a vowel, then we need to add the next letter to the first part
        if (lastLetter !== null) {
          firstPart += word[firstVowelIndex[0].length + 1];
          restOfWord = word.slice(firstPart.length + 1);
        }

        return `<mark>${firstPart}</mark>${restOfWord}`;
      } else {
        return word;
      }
    });

    // Replace the text content of the <p> element with the highlighted text
    text.innerHTML = halfWords.join(" ");
  });
}

const currentURL = window.location.href;

// Select the node that will be observed for changes
const targetNode = document.body;

// Create an observer instance
const observer = new MutationObserver((mutationsList) => {
  // Handle changes here
  console.log("Content changed!");
  const currentURL = window.location.href;

  //Iterate over every element in the mutation list and call boldFirstHalfOfWords if it's a p, span, li, or a tag
  for (const mutation of mutationsList) {
    if (mutation.type === "childList") {
      for (const node of mutation.addedNodes) {
        if (
          node.tagName === "P" ||
          node.tagName === "SPAN" ||
          node.tagName === "LI" ||
          node.tagName === "A"
        ) {
          boldFirstHalfOfWords(node);
        }
      }
    }
  }
});

// Start observing the target node for configured mutations
observer.observe(targetNode, { childList: true, subtree: true });

document.addEventListener("DOMContentLoaded", highlightFirstSyllable());
