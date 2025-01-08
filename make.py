import os
import shutil
from pathlib import Path


def clean():
    shutil.rmtree("deps", ignore_errors=True)
    shutil.rmtree("inst/deps", ignore_errors=True)
    shutil.rmtree("R", ignore_errors=True)
    shutil.rmtree("man", ignore_errors=True)
    shutil.rmtree("src/jl", ignore_errors=True)
    Path("NAMESPACE").unlink(missing_ok=True)
    for file in Path("src").glob("*.jl"):
        if str(file).endswith(".jl"):
            file.unlink()
    os.rename("dash_nlp_components", "dash_nlp_components_temp")
    Path("dash_nlp_components").mkdir(exist_ok=False)
    # move init
    shutil.move(
        "dash_nlp_components_temp/__init__.py", "dash_nlp_components/__init__.py"
    )
    shutil.rmtree("dash_nlp_components_temp")


def make():
    os.system("npm run build")
    os.system("python -m src.demo")


# Call the clean function
if __name__ == "__main__":
    clean()
    make()
