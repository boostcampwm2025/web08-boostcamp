#!/bin/bash

################################################################################
# Piston Language Runtime Installation Script
################################################################################
# Purpose:
#   Install language runtimes for Piston.
#
# Available Piston API Endpoints:
#   GET  /api/v2/packages   - List available packages
#   POST /api/v2/packages   - Install a package
#                             Request: { language: <name>, version: <version> }
#   DELETE /api/v2/packages - Uninstall a package
#                             Request: { language: <name>, version: <version> }
#   GET  /api/v2/runtimes   - List installed runtimes
#   POST /api/v2/execute    - Execute a code
#                             Request: { language: <lang>, version: <version>, files: File[] }
#                             File: { name: <filename>, content: <code> }
#
# Prerequisites:
#   - Piston API server must be running
#   - curl must be installed
#
# Exit Codes:
#   0 - Success
#   1 - API connectivity failure
#   2 - Package validation failure
#   3 - Installation failure
################################################################################

set -euo pipefail

# ============================================================================
# Configuration
# ============================================================================

readonly PISTON_API_URL="${PISTON_API_URL:-http://localhost:2000/api/v2}"
readonly API_TIMEOUT=5
readonly POLL_INTERVAL=5
readonly MAX_POLL_ATTEMPTS=60

# Define target runtimes to install
declare -A RUNTIMES=(
    ["gcc"]="10.2.0"
    ["java"]="15.0.2"
    ["node"]="20.11.1"
    ["typescript"]="5.0.3"
    ["python"]="3.10.0"
)

# ============================================================================
# Utility Functions
# ============================================================================

log_info() {
    echo "[·] $*"
}

log_result() {
    echo "[*] $*"
}

log_success() {
    echo "[✓] $*"
}

log_error() {
    echo "[✗] $*" >&2
}

log_section() {
    echo ""
    echo "==============================================="
    echo " $*"
    echo "==============================================="
}

# ============================================================================
# API Functions
# ============================================================================

get_available_packages() {
    curl -s --connect-timeout "${API_TIMEOUT}" \
        "${PISTON_API_URL}/packages"
}

get_installed_packages() {
    curl -s --connect-timeout "${API_TIMEOUT}" \
        "${PISTON_API_URL}/runtimes"
}

install_package() {
    local name=$1
    local version=$2
    
    log_info "Installing: ${name} (${version})..."
    
    local response
    response=$(curl -s -X POST "${PISTON_API_URL}/packages" \
        -H "Content-Type: application/json" \
        -d "{\"language\":\"${name}\",\"version\":\"${version}\"}")
    
    if echo "${response}" | grep -q '"message"'; then
        local message
        message=$(echo "${response}" | grep -oP '(?<="message":")[^"]*' || echo "Unknown error")
        
        if echo "${message}" | grep -qi "already installed\|exists"; then
            log_success "${name}-${version} already installed"
            return 0
        else
            log_error "${name}-${version}: ${message}"
            return 1
        fi
    else
        log_success "${name}-${version} installation initiated"
        return 0
    fi
}

check_package_installed() {
    local name=$1
    local version=$2
    
    get_installed_packages | \
        grep "\"version\":\"${version}\"" | \
        grep -q "\"language\":\"${name}\"\|\"runtime\":\"${name}\""
}

# ============================================================================
# Validation Functions
# ============================================================================

check_api_connectivity() {
    log_info "Checking Piston API connectivity..."
    
    if curl -s --connect-timeout "${API_TIMEOUT}" \
        "${PISTON_API_URL}/runtimes" > /dev/null 2>&1; then
        log_success "API server is reachable at ${PISTON_API_URL}"
        return 0
    else
        log_error "Cannot connect to Piston API at ${PISTON_API_URL}"
        log_error "Please ensure Piston is running and accessible"
        return 1
    fi
}

validate_packages() {
    local available_json=$1
    local validation_failed=0
    
    log_info "Validating requested language packages..."
    
    for name in "${!RUNTIMES[@]}"; do
        local version=${RUNTIMES[$name]}
        
        if echo "${available_json}" | \
            grep -q "\"language\":\"${name}\",\"language_version\":\"${version}\""; then
            log_success "Found: ${name} ${version}"
        else
            log_error "Package not found: ${name} ${version}"
            validation_failed=1
        fi
    done
    
    if [[ ${validation_failed} -eq 1 ]]; then
        log_error "Package validation failed"
        log_error "View available packages: curl ${PISTON_API_URL}/packages"
        return 2
    fi
    
    log_success "All packages validated"
    return 0
}

# ============================================================================
# Installation with Polling
# ============================================================================

wait_for_installation() {
    local name=$1
    local version=$2
    local attempt=0
    
    while [[ ${attempt} -lt ${MAX_POLL_ATTEMPTS} ]]; do
        if check_package_installed "${name}" "${version}"; then
            log_success "${name}-${version} installation completed"
            return 0
        fi
        
        ((attempt++))
        sleep "${POLL_INTERVAL}"
    done
    
    log_error "${name}-${version} installation timeout"
    return 1
}

# ============================================================================
# Main Execution
# ============================================================================

main() {
    log_section "Piston Runtime Setup"
    
    # Step 1: Check API connectivity
    if ! check_api_connectivity; then
        exit 1
    fi
    
    # Step 2: Fetch and validate available packages
    log_info "Fetching available package list..."
    local available_packages
    available_packages=$(get_available_packages)
    
    if ! validate_packages "${available_packages}"; then
        exit 2
    fi
    
    # Step 3: Install Languages
    log_section "Installing Language Runtimes"
    
    local install_failed=0
    declare -a pending_installs=()
    
    for name in "${!RUNTIMES[@]}"; do
        local version=${RUNTIMES[$name]}
        
        if check_package_installed "${name}" "${version}"; then
            log_success "${name}-${version} already installed"
        else
            if install_package "${name}" "${version}"; then
                pending_installs+=("${name}:${version}")
            else
                install_failed=1
            fi
        fi
    done
    
    # Step 4: Poll for installation completion
    if [[ ${#pending_installs[@]} -gt 0 ]]; then
        log_section "Waiting for Installations"
        
        for install in "${pending_installs[@]}"; do
            IFS=':' read -r name version <<< "${install}"
            
            if ! wait_for_installation "${name}" "${version}"; then
                install_failed=1
            fi
        done
    fi
    
    if [[ ${install_failed} -eq 1 ]]; then
        log_error "Some installations failed"
        exit 3
    fi
    
    # Step 5: Display final status
    log_section "Installation Complete"
    
    log_result "Installed languages:"
    get_installed_packages | \
        grep -oP '(?<="language":")[^"]*|(?<="version":")[^"]*' | \
        paste - - | \
        sed 's/\t/ → /' | \
        sort | \
        while read -r line; do
            echo "  • ${line}"
        done
    
    echo ""
    log_result "Total runtimes: ${#RUNTIMES[@]}"
    log_result "All language runtimes installed successfully"
}

main "$@"
