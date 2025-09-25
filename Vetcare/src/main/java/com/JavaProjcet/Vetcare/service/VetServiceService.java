    package com.JavaProjcet.Vetcare.service;

    import com.JavaProjcet.Vetcare.entity.ServiceResponse;
    import com.JavaProjcet.Vetcare.entity.Services;  // Make sure this matches your entity class name
    import com.JavaProjcet.Vetcare.repository.ServicesRepository;
    import org.springframework.beans.factory.annotation.Autowired;
    import org.springframework.stereotype.Service;
    import org.springframework.transaction.annotation.Transactional;

    import java.util.List;
    import java.util.Optional;
    import java.util.stream.Collectors;

    @Service
    @Transactional
    public class VetServiceService {

        @Autowired
        private ServicesRepository serviceRepository;

        public List<ServiceResponse> getAllServices() {
            List<Services> services  = serviceRepository.findAll();// Changed to Services
            return services.stream()
                    .map(this::convertToResponse)
                    .collect(Collectors.toList());
        }

        public Optional<Services> findById(Long id) {
            return serviceRepository.findById(id);
        }

        private ServiceResponse convertToResponse(Services service) {
            String priceDisplay = service.getPrice() != null ?
                    service.getPrice().toString() : "Price on request";

            return new ServiceResponse(
                    service.getId(),
                    service.getTitle(),
                    service.getDescription(),
                    service.getIcon(),
                    priceDisplay
            );
        }
    }