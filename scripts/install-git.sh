#!/bin/bash

# Install git on Vercel deployment
echo "Installing git for Vercel deployment..."

# Check if we're in a Vercel environment
if [ "$VERCEL" = "1" ]; then
    echo "Running in Vercel environment"
    
    # Check if git is already installed
    if command -v git &> /dev/null; then
        echo "Git is already installed"
        git --version
        exit 0
    fi

    # Install git using apt-get (Vercel uses Ubuntu-based containers)
    echo "Installing git using apt-get..."
    apt-get update -qq
    apt-get install -y git

    # Verify installation
    if command -v git &> /dev/null; then
        echo "Git successfully installed"
        git --version
    else
        echo "Git installation failed"
        exit 1
    fi
else
    echo "Not in Vercel environment, skipping git installation"
    
    # Just check if git exists locally
    if command -v git &> /dev/null; then
        echo "Git is available locally"
        git --version
    else
        echo "Git not found locally - please install git for local development"
    fi
fi
