const handleEditTeam = () => {
    if (!selectedCoverImage) {
        Utility.showToast('Please add a cover image')
        return;
    }
    if (!selectedProfileImage) {
        Utility.showToast('Please add logo')
        return;
    }
    if (!teamName.trim()) {
        Utility.showToast('Please enter team name')
        return;
    }
    if (!selectedSport) {
        Utility.showToast('Please select sport')
        return;
    }
    if (!selectedCountry) {
        Utility.showToast('Please select country')
        return;
    }
    if (stateList?.length > 0 && !selectedState) {
        Utility.showToast('Please select state')
        return;
    }
    if (cityList?.length > 0 && !selectedCity) {
        Utility.showToast('Please select city')
        return;
    }
    if (!selectedColor) {
        Utility.showToast('Please select team color')
        return;
    }

    let coverPhoto = {
        name: selectedCoverImage.fileName,
        type: selectedCoverImage.type,
        uri: selectedCoverImage.uri,
    }
    let profilePhoto = {
        name: selectedProfileImage.fileName,
        type: selectedProfileImage.type,
        uri: selectedProfileImage.uri,
    }
    let isUpdate = false;

    const data = new FormData();
    if (teamDetails?.teamName !== teamName) {
        isUpdate = true;
        data.append('teamName', teamName.toUpperCase());
    }
    if (teamDetails?.tagLine !== tagline) {
        isUpdate = true;
        data.append('tagLine', tagline);
    }
    if (teamDetails?.coverPhoto !== selectedCoverImage?.uri) {
        isUpdate = true;
        data.append('coverPhoto', coverPhoto);
    }
    if (teamDetails?.logo !== selectedProfileImage?.uri) {
        isUpdate = true;
        data.append('logo', profilePhoto);
    }
    if (teamDetails?.sport?._id != selectedSport?.value) {
        isUpdate = true;
        data.append('sports_id', selectedSport?.value);
    }
    if (teamDetails?.country != selectedCountry?.label) {
        isUpdate = true;
        data.append('country', selectedCountry?.label);
    }
    if (stateList?.length > 0 && teamDetails?.state != selectedState?.label) {
        isUpdate = true;
        data.append('state', selectedState?.label);
    }
    if (cityList?.length > 0 && teamDetails?.city != selectedCity?.label) {
        isUpdate = true;
        data.append('city', selectedCity?.label);
    }
    if (teamDetails?.colour?._id != selectedColor?._id) {
        isUpdate = true;
        data.append('teamColour_id', selectedColor?._id)
    }
    if (isUpdate) {
        let url = user/team/edit/${teamDetails?._id};
        setIsLoading(true);
        UploadService.fetchPutFormData(url, data).then((response) => {
            setIsLoading(false);
            if (response.status == 200) {
                Utility.showToast(response?.message);
                navigation.goBack();
            } else {
                Utility.showToast(response?.errors?.msg);
                if (response.status == 401) {
                    Utility.Logout(navigation, response);
                }
            }
        })
            .catch((error) => {
                Utility.log("LoginError:", error);

            });
    } else {
        navigation.goBack();
    }
}