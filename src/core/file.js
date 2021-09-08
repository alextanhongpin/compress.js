const load = (file) => {
  return new Promise((resolve, reject) => {
    const fileReader = new window.FileReader();
    fileReader.addEventListener(
      "load",
      (evt) => resolve(evt.target.result),
      false
    );

    fileReader.addEventListener("error", reject, false);

    fileReader.readAsDataURL(file);
  });
};

export default { load };
