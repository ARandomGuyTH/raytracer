CPP_COMPILER = g++
C_COMPILER = gcc
SRC_DIRS = src
BUILD_DIR = build

INCLUDE_FOLDER = -Idependencies
LIB_FOLDER = -Ldependencies/lib
LINKER_OPTIONS = -lglfw -lGL -lX11 -lpthread -lXrandr -lXi -ldl

FLAGS = -Wall -g -fsanitize=address -Wextra -O2 -MP -MD $(INCLUDE_FOLDER) $(LIB_FOLDER) $(LINKER_OPTIONS)

SRC_FILES = $(foreach D, $(SRC_DIRS), $(wildcard $(D)/*.c $(D)/*.cpp))
OBJECTS = $(patsubst %.cpp, $(BUILD_DIR)/%.o, $(patsubst %.c, $(BUILD_DIR)/%.o, $(SRC_FILES)))
DEPENDENCIES = $(patsubst %.o, %.d, $(OBJECTS))
-include $(DEPENDENCIES)

$(BUILD_DIR)/%.o: %.c
	$(C_COMPILER) $(FLAGS) $< -c -o  $@

$(BUILD_DIR)/%.o: %.cpp
	$(CPP_COMPILER) $(FLAGS) $< -c -o  $@

out/project: $(OBJECTS)
	$(CPP_COMPILER) $(FLAGS) $^ -o  $@

all: out/project
	out/project

clean:
	rm -rf $(OBJECTS) $(DEPENDENCIES)
